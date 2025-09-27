'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WateringEvent, HealthMetrics } from '@/lib/date-utils';
import { Plant, Species } from '@prisma/client';
import { TrendingUp, TrendingDown, Minus, Droplets, Calendar, AlertTriangle } from 'lucide-react';

interface PlantHealthMetricsProps {
  plant: Plant & { species: Species };
  wateringEvents: WateringEvent[];
  healthMetrics: HealthMetrics;
  className?: string;
}

const HealthScoreIndicator = ({ score }: { score: number }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className="text-center">
      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreBg(score)} mb-2`}>
        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
          {score}
        </span>
      </div>
      <div className={`text-sm font-medium ${getScoreColor(score)}`}>
        {getScoreLabel(score)}
      </div>
    </div>
  );
};

const TrendIndicator = ({ trend }: { trend: 'improving' | 'stable' | 'declining' }) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendLabel = () => {
    switch (trend) {
      case 'improving':
        return 'Improving';
      case 'declining':
        return 'Declining';
      default:
        return 'Stable';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${getTrendColor()}`}>
      {getTrendIcon()}
      <span className="text-sm font-medium">{getTrendLabel()}</span>
    </div>
  );
};

export function PlantHealthMetrics({ 
  plant, 
  wateringEvents, 
  healthMetrics, 
  className = '' 
}: PlantHealthMetricsProps) {
  const speciesDefault = plant.species?.defaultWaterDays || 7;
  const isOverdue = plant.nextWaterDue && new Date() > plant.nextWaterDue;

  // Generate care insights
  const getCareInsights = () => {
    const insights = [];
    
    if (healthMetrics.averageDays < speciesDefault - 2) {
      insights.push({
        type: 'warning',
        message: 'You might be overwatering. Try spacing out waterings a bit more.',
        icon: '💧'
      });
    } else if (healthMetrics.averageDays > speciesDefault + 3) {
      insights.push({
        type: 'warning',
        message: 'Consider watering more frequently. Your plant might be thirsty.',
        icon: '🌱'
      });
    }

    if (healthMetrics.consistency < 60) {
      insights.push({
        type: 'info',
        message: 'Try to water on a more regular schedule for better plant health.',
        icon: '📅'
      });
    }

    if (healthMetrics.longestGap > speciesDefault * 2) {
      insights.push({
        type: 'warning',
        message: `You had a ${healthMetrics.longestGap}-day gap between waterings. Try to stay more consistent.`,
        icon: '⚠️'
      });
    }

    if (healthMetrics.trend === 'improving') {
      insights.push({
        type: 'success',
        message: 'Great job! Your watering consistency is improving.',
        icon: '🎉'
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'success',
        message: 'Your plant care routine looks great! Keep up the good work.',
        icon: '✨'
      });
    }

    return insights;
  };

  const insights = getCareInsights();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5" />
            Overall Health Score
          </CardTitle>
          <CardDescription>
            Based on watering consistency and frequency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <HealthScoreIndicator score={healthMetrics.healthScore} />
            <div className="text-right">
              <TrendIndicator trend={healthMetrics.trend} />
              <div className="text-sm text-gray-600 mt-1">
                vs species default ({speciesDefault} days)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Watering Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Watering Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {healthMetrics.averageDays}
              </div>
              <div className="text-sm text-gray-600">Avg Days Between</div>
              <div className="text-xs text-gray-500 mt-1">
                Target: {speciesDefault} days
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {healthMetrics.consistency}%
              </div>
              <div className="text-sm text-gray-600">Consistency</div>
              <div className="text-xs text-gray-500 mt-1">
                How regular your schedule is
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {healthMetrics.totalWaterings}
              </div>
              <div className="text-sm text-gray-600">Last 30 Days</div>
              <div className="text-xs text-gray-500 mt-1">
                Total waterings
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {healthMetrics.longestGap}
              </div>
              <div className="text-sm text-gray-600">Longest Gap</div>
              <div className="text-xs text-gray-500 mt-1">
                Days between waterings
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Watered</span>
              <Badge variant={plant.lastWateredAt ? "default" : "secondary"}>
                {plant.lastWateredAt 
                  ? new Date(plant.lastWateredAt).toLocaleDateString()
                  : 'Never'
                }
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Next Due</span>
              <Badge variant={isOverdue ? "destructive" : "default"}>
                {plant.nextWaterDue 
                  ? new Date(plant.nextWaterDue).toLocaleDateString()
                  : 'Not scheduled'
                }
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Moisture Preference</span>
              <Badge variant="outline">
                {plant.moistureBias > 0 ? '+' : ''}{plant.moistureBias}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Care Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Care Insights</CardTitle>
          <CardDescription>
            Personalized recommendations based on your watering history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  insight.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                  insight.type === 'success' ? 'bg-green-50 border border-green-200' :
                  'bg-blue-50 border border-blue-200'
                }`}
              >
                <span className="text-lg">{insight.icon}</span>
                <p className={`text-sm ${
                  insight.type === 'warning' ? 'text-yellow-800' :
                  insight.type === 'success' ? 'text-green-800' :
                  'text-blue-800'
                }`}>
                  {insight.message}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
