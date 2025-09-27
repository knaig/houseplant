'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { RefreshCw, Wifi, WifiOff, AlertTriangle, Users, MessageSquare } from 'lucide-react';

interface ConversationStatusData {
  isActive: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'warning' | 'error';
  participantCount: number;
  lastActivity: string | null;
  messageStats: {
    today: number;
    week: number;
    month: number;
    mostActivePlant: string | null;
  };
  statusMessage: string;
  conversation: {
    id: string;
    name: string;
    createdAt: string;
  };
}

interface ConversationStatusProps {
  conversationId: string;
  className?: string;
  compact?: boolean;
}

export function ConversationStatus({ conversationId, className, compact = false }: ConversationStatusProps) {
  const [status, setStatus] = useState<ConversationStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch(`/api/groups/${conversationId}/status`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }

      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchStatus();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [conversationId]);

  const handleRefresh = () => {
    fetchStatus(true);
  };

  const getStatusIcon = () => {
    if (!status) return <WifiOff className="h-4 w-4" />;
    
    switch (status.connectionStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <WifiOff className="h-4 w-4 text-red-600" />;
      default:
        return <WifiOff className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    if (!status) return 'secondary';
    
    switch (status.connectionStatus) {
      case 'connected':
        return 'default';
      case 'disconnected':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
        <span className="text-sm text-muted-foreground">Loading status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Badge variant="destructive" className="text-xs">
          Error
        </Badge>
        <Button
          onClick={handleRefresh}
          size="sm"
          variant="outline"
          className="h-6 px-2 text-xs"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('flex items-center gap-2 cursor-pointer', className)}>
              {getStatusIcon()}
              <Badge variant={getStatusColor() as any} className="text-xs">
                {status.connectionStatus}
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-medium">{status.statusMessage}</p>
              <p className="text-muted-foreground">
                {status.participantCount} participants
              </p>
              {status.lastActivity && (
                <p className="text-muted-foreground">
                  Last activity: {formatDistanceToNow(new Date(status.lastActivity), { addSuffix: true })}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <h3 className="font-medium">WhatsApp Group Status</h3>
          </div>
          <Button
            onClick={handleRefresh}
            size="sm"
            variant="outline"
            disabled={refreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          </Button>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor() as any}>
            {status.connectionStatus}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {status.statusMessage}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{status.participantCount} participants</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span>{status.messageStats.today} today</span>
          </div>
        </div>

        {/* Activity */}
        {status.lastActivity && (
          <div className="text-sm text-muted-foreground">
            Last activity: {formatDistanceToNow(new Date(status.lastActivity), { addSuffix: true })}
          </div>
        )}

        {/* Message stats */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Message Activity</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-medium">{status.messageStats.today}</div>
              <div className="text-muted-foreground">Today</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-medium">{status.messageStats.week}</div>
              <div className="text-muted-foreground">This Week</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-medium">{status.messageStats.month}</div>
              <div className="text-muted-foreground">This Month</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {status.connectionStatus !== 'connected' && (
          <div className="pt-2 border-t">
            <Button
              onClick={handleRefresh}
              size="sm"
              variant="outline"
              className="w-full"
            >
              Reconnect
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
