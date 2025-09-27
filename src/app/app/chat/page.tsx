import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { MessageHistory } from '@/components/message-history';
import { ConversationStatus } from '@/components/conversation-status';
import { BulkMessageComposer } from '@/components/bulk-message-composer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, MessageSquare, Settings } from 'lucide-react';
import Link from 'next/link';

export default async function ChatPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // Get user's conversation
  const conversation = await db.conversation.findFirst({
    where: {
      user: {
        clerkId: userId
      }
    },
    include: {
      user: true,
      plants: {
        where: {
          isActive: true
        }
      }
    }
  });

  if (!conversation) {
    redirect('/app');
  }

  const plants = conversation.plants.map(plant => ({
    id: plant.id,
    name: plant.name,
    personalityEmoji: plant.personalityEmoji,
    isActive: plant.isActive
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Link href="/app">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <h1 className="text-lg font-semibold">Plant Family Chat</h1>
                </div>
                <Badge variant="outline" className="text-xs">
                  {plants.length + 1} participants
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ConversationStatus 
                conversationId={conversation.id} 
                compact 
              />
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Link href="/app">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Message History */}
            <MessageHistory 
              conversationId={conversation.id}
              className="h-[500px]"
            />

            {/* Bulk Message Composer */}
            <BulkMessageComposer
              conversationId={conversation.id}
              plants={plants}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <ConversationStatus 
              conversationId={conversation.id}
            />

            {/* Participants */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-green-600" />
                <h3 className="font-medium">Participants</h3>
              </div>
              
              <div className="space-y-3">
                {/* User */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm">👤</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">You</div>
                    <div className="text-xs text-muted-foreground">Plant Parent</div>
                  </div>
                  <Badge variant="default" className="text-xs">
                    Active
                  </Badge>
                </div>

                {/* Plants */}
                {plants.map((plant) => (
                  <div key={plant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-sm">{plant.personalityEmoji || '🌱'}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{plant.name}</div>
                      <div className="text-xs text-muted-foreground">Plant</div>
                    </div>
                    <Badge 
                      variant={plant.isActive ? "default" : "secondary"} 
                      className="text-xs"
                    >
                      {plant.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <h3 className="font-medium">Quick Actions</h3>
              </div>
              
              <div className="space-y-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Link href="/app">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
                
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Link href="/app">
                    <Settings className="h-4 w-4 mr-2" />
                    Conversation Settings
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
