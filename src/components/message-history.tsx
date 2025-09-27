'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  author: string;
  authorEmoji: string;
  authorName: string;
  createdAt: string;
  messageType: string;
  isInbound: boolean;
}

interface MessageHistoryProps {
  conversationId: string;
  className?: string;
}

export function MessageHistory({ conversationId, className }: MessageHistoryProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isAtBottomRef = useRef(true);

  // Fetch messages
  const fetchMessages = useCallback(async (cursor?: string, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);
      params.append('limit', '50');

      const response = await fetch(`/api/groups/${conversationId}/messages?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      
      if (append) {
        setMessages(prev => [...data.messages, ...prev]);
      } else {
        setMessages(data.messages);
        setNewMessagesCount(0);
      }
      
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [conversationId]);

  // Load more messages when scrolling to top
  const loadMoreMessages = useCallback(() => {
    if (hasMore && !loadingMore && nextCursor) {
      fetchMessages(nextCursor, true);
    }
  }, [hasMore, loadingMore, nextCursor, fetchMessages]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setNewMessagesCount(0);
    }
  }, []);

  // Check if user is at bottom
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    isAtBottomRef.current = isAtBottom;
    
    if (isAtBottom) {
      setNewMessagesCount(0);
    }
  }, []);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const topElement = document.querySelector('[data-message-top]');
    if (!topElement) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreMessages();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(topElement);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loadMoreMessages]);

  // Initial load
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Poll for new messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAtBottomRef.current) {
        // Refresh messages if at bottom
        fetchMessages();
      } else {
        // Just check for new messages count
        fetch(`/api/groups/${conversationId}/messages?limit=1`)
          .then(res => res.json())
          .then(data => {
            if (data.messages.length > 0) {
              const latestMessage = data.messages[0];
              const isNewMessage = !messages.find(m => m.id === latestMessage.id);
              if (isNewMessage) {
                setNewMessagesCount(prev => prev + 1);
              }
            }
          })
          .catch(console.error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [conversationId, messages, fetchMessages]);

  // Group consecutive messages from same author
  const groupedMessages = messages.reduce((groups: Message[][], message, index) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    
    if (prevMessage && 
        prevMessage.author === message.author && 
        new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() < 5 * 60 * 1000) {
      // Same author within 5 minutes - group with previous
      groups[groups.length - 1].push(message);
    } else {
      // New group
      groups.push([message]);
    }
    
    return groups;
  }, []);

  if (loading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading messages...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchMessages()} variant="outline">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-0 overflow-hidden', className)}>
      <ScrollArea 
        ref={scrollAreaRef}
        className="h-96"
        onScrollCapture={handleScroll}
      >
        <div className="p-4 space-y-4">
          {loadingMore && (
            <div className="flex justify-center py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            </div>
          )}
          
          {!hasMore && (
            <div data-message-top className="text-center text-xs text-muted-foreground py-2">
              No more messages
            </div>
          )}
          
          {groupedMessages.map((group, groupIndex) => {
            const firstMessage = group[0];
            const isPlant = firstMessage.author.startsWith('plant_');
            const isUser = firstMessage.author === 'user';
            const isSystem = firstMessage.author === 'system';
            
            return (
              <div key={firstMessage.id} className={cn(
                'flex',
                isUser ? 'justify-end' : 'justify-start',
                isSystem ? 'justify-center' : ''
              )}>
                <div className={cn(
                  'max-w-[80%] space-y-1',
                  isSystem ? 'text-center' : ''
                )}>
                  {/* Author info for first message in group */}
                  {groupIndex === 0 || groupedMessages[groupIndex - 1][0].author !== firstMessage.author ? (
                    <div className={cn(
                      'flex items-center gap-2 text-xs text-muted-foreground mb-1',
                      isUser ? 'justify-end' : 'justify-start',
                      isSystem ? 'justify-center' : ''
                    )}>
                      <span>{firstMessage.authorEmoji}</span>
                      <span>{firstMessage.authorName}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(firstMessage.createdAt), { addSuffix: true })}</span>
                    </div>
                  ) : null}
                  
                  {/* Message bubbles */}
                  <div className="space-y-1">
                    {group.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'px-3 py-2 rounded-lg text-sm',
                          isPlant && 'bg-green-100 text-green-900 border border-green-200',
                          isUser && 'bg-blue-100 text-blue-900 border border-blue-200',
                          isSystem && 'bg-gray-100 text-gray-700 border border-gray-200 text-center'
                        )}
                      >
                        {message.content}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* New messages indicator */}
      {newMessagesCount > 0 && (
        <div className="absolute bottom-4 right-4">
          <Button
            onClick={scrollToBottom}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            {newMessagesCount} new message{newMessagesCount > 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </Card>
  );
}
