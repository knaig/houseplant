'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Send, Users, MessageSquare, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Plant {
  id: string;
  name: string;
  personalityEmoji: string | null;
  isActive: boolean;
}

interface BulkMessageComposerProps {
  conversationId: string;
  plants: Plant[];
  className?: string;
  onMessageSent?: () => void;
}

interface SendResult {
  success: boolean;
  results: {
    sent: number;
    failed: number;
    errors: string[];
  };
  batchId: string;
  message: string;
}

export function BulkMessageComposer({ 
  conversationId, 
  plants, 
  className, 
  onMessageSent 
}: BulkMessageComposerProps) {
  const [message, setMessage] = useState('');
  const [selectedPlants, setSelectedPlants] = useState<string[]>([]);
  const [sendAsSystem, setSendAsSystem] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const messageTemplates = [
    {
      name: 'Seasonal Greeting',
      content: 'Happy Spring from your plant family! 🌸 We\'re growing strong thanks to your care!',
      emoji: '🌸'
    },
    {
      name: 'Care Reminder',
      content: 'Remember to check our soil moisture regularly! We love staying hydrated 💧',
      emoji: '💧'
    },
    {
      name: 'Celebration',
      content: 'We\'re celebrating another week of growth! Thanks for being an amazing plant parent! 🌱',
      emoji: '🌱'
    },
    {
      name: 'Weather Alert',
      content: 'Weather alert: Please move us to a safer spot if needed! We want to stay healthy 🌤️',
      emoji: '🌤️'
    }
  ];

  // Select all plants by default
  useEffect(() => {
    const activePlantIds = plants.filter(plant => plant.isActive).map(plant => plant.id);
    setSelectedPlants(activePlantIds);
  }, [plants]);

  const handlePlantToggle = (plantId: string) => {
    setSelectedPlants(prev => 
      prev.includes(plantId) 
        ? prev.filter(id => id !== plantId)
        : [...prev, plantId]
    );
  };

  const handleSelectAll = () => {
    const activePlantIds = plants.filter(plant => plant.isActive).map(plant => plant.id);
    setSelectedPlants(activePlantIds);
  };

  const handleDeselectAll = () => {
    setSelectedPlants([]);
  };

  const handleTemplateSelect = (template: string) => {
    setMessage(template);
    setShowTemplates(false);
  };

  const handleSend = async () => {
    if (!message.trim() || selectedPlants.length === 0) {
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const response = await fetch(`/api/groups/${conversationId}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          plantIds: sendAsSystem ? [] : selectedPlants,
          sendAsSystem
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setResult(data);
      setMessage('');
      onMessageSent?.();
    } catch (error) {
      setResult({
        success: false,
        results: { sent: 0, failed: 1, errors: [error instanceof Error ? error.message : 'Unknown error'] },
        batchId: '',
        message: 'Failed to send message'
      });
    } finally {
      setSending(false);
    }
  };

  const selectedCount = selectedPlants.length;
  const totalActivePlants = plants.filter(plant => plant.isActive).length;
  const isAllSelected = selectedCount === totalActivePlants;
  const canSend = message.trim().length > 0 && (selectedCount > 0 || sendAsSystem) && !sending;

  return (
    <Card className={cn('p-4 space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          <h3 className="font-medium">Bulk Message</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {selectedCount} of {totalActivePlants} plants
        </Badge>
      </div>

      {/* Plant Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Select Plants</Label>
          <div className="flex gap-2">
            <Button
              onClick={handleSelectAll}
              size="sm"
              variant="outline"
              disabled={isAllSelected}
              className="h-7 px-2 text-xs"
            >
              Select All
            </Button>
            <Button
              onClick={handleDeselectAll}
              size="sm"
              variant="outline"
              disabled={selectedCount === 0}
              className="h-7 px-2 text-xs"
            >
              Deselect All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
          {plants.map((plant) => (
            <div key={plant.id} className="flex items-center space-x-2">
              <Checkbox
                id={plant.id}
                checked={selectedPlants.includes(plant.id)}
                onCheckedChange={() => handlePlantToggle(plant.id)}
                disabled={!plant.isActive}
              />
              <Label
                htmlFor={plant.id}
                className={cn(
                  'text-sm flex items-center gap-1 cursor-pointer',
                  !plant.isActive && 'text-muted-foreground'
                )}
              >
                <span>{plant.personalityEmoji || '🌱'}</span>
                <span>{plant.name}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* System Message Option */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="sendAsSystem"
          checked={sendAsSystem}
          onCheckedChange={(checked) => setSendAsSystem(checked as boolean)}
        />
        <Label htmlFor="sendAsSystem" className="text-sm">
          Send as system message (from Plant Family)
        </Label>
      </div>

      {/* Message Templates */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Message Templates</Label>
          <Button
            onClick={() => setShowTemplates(!showTemplates)}
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
          >
            {showTemplates ? 'Hide' : 'Show'} Templates
          </Button>
        </div>

        {showTemplates && (
          <div className="grid grid-cols-1 gap-2">
            {messageTemplates.map((template, index) => (
              <Button
                key={index}
                onClick={() => handleTemplateSelect(template.content)}
                variant="outline"
                className="h-auto p-3 text-left justify-start"
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{template.emoji}</span>
                  <div>
                    <div className="font-medium text-xs">{template.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {template.content}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm font-medium">
          Message Content
        </Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          className="min-h-[80px] resize-none"
          maxLength={160}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{message.length}/160 characters</span>
          <span>SMS compatible</span>
        </div>
      </div>

      {/* Preview */}
      {message.trim() && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Preview</Label>
          <div className="p-3 bg-muted rounded-lg text-sm">
            {sendAsSystem ? (
              <div className="flex items-center gap-2">
                <span>🌱</span>
                <span className="font-medium">Plant Family:</span>
                <span>{message}</span>
              </div>
            ) : (
              <div className="space-y-1">
                {selectedPlants.slice(0, 3).map((plantId) => {
                  const plant = plants.find(p => p.id === plantId);
                  return plant ? (
                    <div key={plantId} className="flex items-center gap-2">
                      <span>{plant.personalityEmoji || '🌱'}</span>
                      <span className="font-medium">{plant.name}:</span>
                      <span>{message}</span>
                    </div>
                  ) : null;
                })}
                {selectedPlants.length > 3 && (
                  <div className="text-muted-foreground">
                    ...and {selectedPlants.length - 3} more plants
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Send Button */}
      <Button
        onClick={handleSend}
        disabled={!canSend}
        className="w-full"
        size="lg"
      >
        {sending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </>
        )}
      </Button>

      {/* Result */}
      {result && (
        <div className={cn(
          'p-3 rounded-lg border',
          result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        )}>
          <div className="flex items-center gap-2 mb-2">
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <span className={cn(
              'text-sm font-medium',
              result.success ? 'text-green-800' : 'text-red-800'
            )}>
              {result.message}
            </span>
          </div>
          
          {result.results && (
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Sent:</span>
                <span className="text-green-600">{result.results.sent}</span>
              </div>
              <div className="flex justify-between">
                <span>Failed:</span>
                <span className="text-red-600">{result.results.failed}</span>
              </div>
              {result.results.errors.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium">Errors:</div>
                  {result.results.errors.map((error, index) => (
                    <div key={index} className="text-red-600">• {error}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
