'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WateringEvent, ChartDataPoint } from '@/lib/date-utils';
import { Plant, Species } from '@prisma/client';

interface WateringTimelineProps {
  wateringEvents: WateringEvent[];
  plant: Plant & { species: Species };
  className?: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">
          Days between waterings: <span className="font-medium">{data.daysBetween}</span>
        </p>
        <p className="text-xs text-gray-500 capitalize">
          Source: {data.type}
        </p>
        {data.isOverdue && (
          <p className="text-xs text-red-600 font-medium">⚠️ Overdue</p>
        )}
      </div>
    );
  }
  return null;
};

export function WateringTimeline({ 
  wateringEvents, 
  plant, 
  className = '',
  height = 300 
}: WateringTimelineProps) {
  // Generate chart data
  const chartData: ChartDataPoint[] = React.useMemo(() => {
    if (wateringEvents.length < 2) return [];
    
    return wateringEvents.slice(1).map(event => ({
      date: event.date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      daysBetween: event.daysSinceLast || 0,
      type: event.type,
      isOverdue: event.daysSinceLast && event.daysSinceLast > 14
    }));
  }, [wateringEvents]);

  // Get species default for reference line
  const speciesDefault = plant.species?.defaultWaterDays || 7;
  
  // Color scheme for different watering types
  const getColorForType = (type: string) => {
    switch (type) {
      case 'manual': return '#10b981'; // green
      case 'sms': return '#3b82f6'; // blue
      case 'whatsapp': return '#25d366'; // whatsapp green
      case 'automatic': return '#8b5cf6'; // purple
      default: return '#6b7280'; // gray
    }
  };

  // Get area color based on health
  const getAreaColor = (daysBetween: number) => {
    if (daysBetween <= speciesDefault + 2) return '#10b981'; // green - healthy
    if (daysBetween <= speciesDefault + 5) return '#f59e0b'; // yellow - caution
    return '#ef4444'; // red - concerning
  };

  if (wateringEvents.length < 2) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Watering Timeline</CardTitle>
          <CardDescription>
            Watering history will appear here after you water your plant a few times
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">🌱</div>
              <p>Not enough data yet</p>
              <p className="text-sm">Water your plant to start tracking!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Watering Timeline</CardTitle>
        <CardDescription>
          Track your watering consistency over time. The green area shows healthy intervals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Days', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Reference line for species default */}
              <ReferenceLine 
                y={speciesDefault} 
                stroke="#6b7280" 
                strokeDasharray="5 5"
                label={{ value: `Species default (${speciesDefault} days)`, position: 'topRight' }}
              />
              
              {/* Area chart for visual appeal */}
              <Area
                type="monotone"
                dataKey="daysBetween"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              
              {/* Line for data points */}
              <Line
                type="monotone"
                dataKey="daysBetween"
                stroke="#10b981"
                strokeWidth={3}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  const color = getColorForType(payload.type);
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={color}
                      stroke="white"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Manual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>WhatsApp</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#25d366' }}></div>
              <span>WhatsApp</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Automatic</span>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {chartData.length}
              </div>
              <div className="text-sm text-gray-600">Total Waterings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(chartData.reduce((sum, d) => sum + d.daysBetween, 0) / chartData.length)}
              </div>
              <div className="text-sm text-gray-600">Avg Days Between</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
