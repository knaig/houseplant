import { Plant, Species, Message } from '@prisma/client';

// Type definitions for watering events and analytics
export interface WateringEvent {
  id: string;
  date: Date;
  type: 'manual' | 'automatic' | 'sms' | 'whatsapp';
  daysSinceLast?: number;
  source: string;
}

export interface ChartDataPoint {
  date: string;
  daysBetween: number;
  type: 'manual' | 'automatic' | 'sms' | 'whatsapp';
  isOverdue?: boolean;
}

export interface HealthMetrics {
  healthScore: number;
  averageDays: number;
  consistency: number;
  totalWaterings: number;
  longestGap: number;
  longestGapDate?: Date;
  trend: 'improving' | 'stable' | 'declining';
}

export interface WateringTrends {
  improving: boolean;
  stable: boolean;
  declining: boolean;
}

export interface WateringStatus {
  lastText: string;
  nextText: string;
  isOverdue: boolean;
  daysSinceLast: number | null;
  daysUntilNext: number | null;
}

/**
 * Calculate next watering date with bias adjustment
 */
export function calculateNextWaterDue(
  lastWatered: Date,
  defaultDays: number,
  moistureBias: number
): Date {
  const biasMultiplier = 1 + (moistureBias / 100);
  const adjustedDays = Math.round(defaultDays * biasMultiplier);
  return new Date(lastWatered.getTime() + (adjustedDays * 24 * 60 * 60 * 1000));
}

/**
 * Calculate days since last watering
 */
export function getDaysSinceWatered(lastWatered: Date | null): number | null {
  if (!lastWatered) return null;
  const now = new Date();
  const diffTime = now.getTime() - lastWatered.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days until next watering (negative if overdue)
 */
export function getDaysUntilNext(nextDue: Date | null): number | null {
  if (!nextDue) return null;
  const now = new Date();
  const diffTime = nextDue.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format watering status for UI display
 */
export function formatWateringStatus(
  lastWatered: Date | null,
  nextDue: Date | null
): WateringStatus {
  const daysSinceLast = getDaysSinceWatered(lastWatered);
  const daysUntilNext = getDaysUntilNext(nextDue);
  const isOverdue = daysUntilNext !== null && daysUntilNext < 0;

  const lastText = lastWatered 
    ? formatRelativeDate(lastWatered)
    : 'Never watered';

  const nextText = nextDue
    ? isOverdue
      ? `${Math.abs(daysUntilNext)} days overdue`
      : daysUntilNext === 0
      ? 'Due today'
      : daysUntilNext === 1
      ? 'Due tomorrow'
      : `Due in ${daysUntilNext} days`
    : 'No schedule set';

  return {
    lastText,
    nextText,
    isOverdue,
    daysSinceLast,
    daysUntilNext
  };
}

/**
 * Format dates as relative time
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Format dates for chart axis labels
 */
export function formatDateForChart(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Process watering history from messages and plant data
 */
export function processWateringHistory(
  messages: Message[],
  plant: Plant
): WateringEvent[] {
  const events: WateringEvent[] = [];
  
  // Add plant creation as first event if it has lastWateredAt
  if (plant.lastWateredAt) {
    events.push({
      id: `plant-${plant.id}-created`,
      date: plant.lastWateredAt,
      type: 'manual',
      source: 'Plant creation'
    });
  }

  // Process messages for watering events
  messages.forEach((message) => {
    if (message.body.includes('watered') || message.body.includes('WATERED')) {
      events.push({
        id: message.id,
        date: message.createdAt,
        type: message.channel === 'SMS' ? 'sms' : 
              message.channel === 'WHATSAPP' ? 'whatsapp' : 'automatic',
        source: message.channel
      });
    }
  });

  // Sort by date and calculate days since last
  events.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  for (let i = 1; i < events.length; i++) {
    const prevEvent = events[i - 1];
    const currentEvent = events[i];
    const diffTime = currentEvent.date.getTime() - prevEvent.date.getTime();
    currentEvent.daysSinceLast = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  return events;
}

/**
 * Calculate watering frequency metrics
 */
export function calculateWateringFrequency(events: WateringEvent[]): {
  averageDays: number;
  consistency: number;
} {
  if (events.length < 2) {
    return { averageDays: 0, consistency: 0 };
  }

  const intervals = events
    .slice(1)
    .map(event => event.daysSinceLast || 0)
    .filter(days => days > 0);

  if (intervals.length === 0) {
    return { averageDays: 0, consistency: 0 };
  }

  const averageDays = intervals.reduce((sum, days) => sum + days, 0) / intervals.length;
  
  // Calculate consistency as inverse of standard deviation
  const variance = intervals.reduce((sum, days) => sum + Math.pow(days - averageDays, 2), 0) / intervals.length;
  const standardDeviation = Math.sqrt(variance);
  const consistency = Math.max(0, 100 - (standardDeviation / averageDays) * 100);

  return { averageDays, consistency };
}

/**
 * Generate timeline data for chart visualization
 */
export function generateTimelineData(events: WateringEvent[]): ChartDataPoint[] {
  if (events.length < 2) return [];

  return events.slice(1).map(event => ({
    date: formatDateForChart(event.date),
    daysBetween: event.daysSinceLast || 0,
    type: event.type,
    isOverdue: event.daysSinceLast && event.daysSinceLast > 14 // Consider overdue if > 2 weeks
  }));
}

/**
 * Calculate health score based on watering consistency
 */
export function calculateHealthScore(
  plant: Plant,
  events: WateringEvent[]
): number {
  if (events.length < 2) return 50; // Neutral score for new plants

  const { averageDays, consistency } = calculateWateringFrequency(events);
  const speciesDefault = plant.species?.defaultWaterDays || 7;
  
  // Score based on how close average is to species recommendation
  const frequencyScore = Math.max(0, 100 - Math.abs(averageDays - speciesDefault) * 10);
  
  // Combine frequency and consistency scores
  const healthScore = (frequencyScore * 0.6) + (consistency * 0.4);
  
  return Math.min(100, Math.max(0, healthScore));
}

/**
 * Analyze watering trends
 */
export function getWateringTrends(events: WateringEvent[]): WateringTrends {
  if (events.length < 4) {
    return { improving: false, stable: true, declining: false };
  }

  const recentEvents = events.slice(-3);
  const olderEvents = events.slice(-6, -3);
  
  if (recentEvents.length < 3 || olderEvents.length < 3) {
    return { improving: false, stable: true, declining: false };
  }

  const recentAvg = recentEvents.reduce((sum, event) => sum + (event.daysSinceLast || 0), 0) / recentEvents.length;
  const olderAvg = olderEvents.reduce((sum, event) => sum + (event.daysSinceLast || 0), 0) / olderEvents.length;
  
  const improvement = recentAvg - olderAvg;
  const threshold = 1; // Days difference threshold
  
  return {
    improving: improvement < -threshold,
    stable: Math.abs(improvement) <= threshold,
    declining: improvement > threshold
  };
}

/**
 * Calculate comprehensive health metrics
 */
export function calculateHealthMetrics(
  plant: Plant,
  events: WateringEvent[]
): HealthMetrics {
  const { averageDays, consistency } = calculateWateringFrequency(events);
  const healthScore = calculateHealthScore(plant, events);
  const trends = getWateringTrends(events);
  
  // Find longest gap
  const intervals = events
    .slice(1)
    .map(event => event.daysSinceLast || 0)
    .filter(days => days > 0);
  
  const longestGap = intervals.length > 0 ? Math.max(...intervals) : 0;
  const longestGapIndex = intervals.indexOf(longestGap);
  const longestGapDate = longestGapIndex >= 0 && events[longestGapIndex + 1] 
    ? events[longestGapIndex + 1].date 
    : undefined;

  // Count recent waterings (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const totalWaterings = events.filter(event => event.date >= thirtyDaysAgo).length;

  return {
    healthScore: Math.round(healthScore),
    averageDays: Math.round(averageDays * 10) / 10,
    consistency: Math.round(consistency),
    totalWaterings,
    longestGap,
    longestGapDate,
    trend: trends.improving ? 'improving' : trends.declining ? 'declining' : 'stable'
  };
}
