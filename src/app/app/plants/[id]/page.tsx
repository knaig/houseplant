import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WateringTimeline } from '@/components/watering-timeline';
import { PlantHealthMetrics } from '@/components/plant-health-metrics';
import { 
  processWateringHistory, 
  calculateHealthMetrics, 
  formatWateringStatus,
  WateringEvent 
} from '@/lib/date-utils';
import { 
  Droplets, 
  Settings, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Sun, 
  Ruler,
  Heart
} from 'lucide-react';
import Link from 'next/link';

interface PlantDetailPageProps {
  params: { id: string };
}

export default async function PlantDetailPage({ params }: PlantDetailPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const plantId = params.id;
  if (!plantId) {
    redirect('/app');
  }

  // Fetch plant data with comprehensive includes
  const plant = await db.plant.findUnique({
    where: { id: plantId },
    include: {
      species: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 50
      }
    }
  });

  if (!plant) {
    redirect('/app');
  }

  if (plant.userId !== userId) {
    redirect('/app');
  }

  // Process watering history and calculate metrics
  const wateringEvents: WateringEvent[] = processWateringHistory(plant.messages, plant);
  const healthMetrics = calculateHealthMetrics(plant, wateringEvents);
  const wateringStatus = formatWateringStatus(plant.lastWateredAt, plant.nextWaterDue);

  // Get personality emoji
  const getPersonalityEmoji = (personality: string) => {
    switch (personality) {
      case 'FUNNY': return '😄';
      case 'COACH': return '💪';
      case 'ZEN': return '🧘';
      case 'CLASSIC': return '🌿';
      default: return '🌱';
    }
  };

  // Get light level display
  const getLightLevelDisplay = (lightLevel: string) => {
    switch (lightLevel) {
      case 'LOW': return 'Low Light';
      case 'MEDIUM': return 'Medium Light';
      case 'HIGH': return 'Bright Light';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/app">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                {getPersonalityEmoji(plant.personality)}
                {plant.name}
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                {plant.species.commonName}
                {plant.species.latinName && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({plant.species.latinName})
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Link href={`/app/plants/${plant.id}/settings`}>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Watering Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              Watering Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {wateringStatus.lastText}
                </div>
                <div className="text-sm text-gray-600">Last Watered</div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${
                  wateringStatus.isOverdue ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {wateringStatus.nextText}
                </div>
                <div className="text-sm text-gray-600">Next Due</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {plant.customWaterDays ?? plant.species.defaultWaterDays}
                </div>
                <div className="text-sm text-gray-600">Days Between</div>
              </div>
            </div>
            
            {wateringStatus.isOverdue && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm font-medium">
                  ⚠️ Your plant is overdue for watering! Consider watering soon.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plant Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Plant Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Plant Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Personality</span>
                <Badge variant="outline">
                  {getPersonalityEmoji(plant.personality)} {plant.personality}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Sun className="w-4 h-4" />
                  Light Level
                </span>
                <Badge variant="outline">
                  {getLightLevelDisplay(plant.lightLevel)}
                </Badge>
              </div>
              
              {plant.location && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Location
                  </span>
                  <span className="text-sm font-medium">{plant.location}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Ruler className="w-4 h-4" />
                  Pot Size
                </span>
                <span className="text-sm font-medium">{plant.potSizeCm}cm</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Moisture Preference</span>
                <Badge variant={plant.moistureBias > 0 ? "default" : "secondary"}>
                  {plant.moistureBias > 0 ? '+' : ''}{plant.moistureBias}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Health Metrics */}
          <div className="lg:col-span-2">
            <PlantHealthMetrics 
              plant={plant}
              wateringEvents={wateringEvents}
              healthMetrics={healthMetrics}
            />
          </div>
        </div>

        {/* Watering Timeline */}
        <div className="mb-8">
          <WateringTimeline 
            wateringEvents={wateringEvents}
            plant={plant}
          />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest messages and watering events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {plant.messages.length > 0 ? (
              <div className="space-y-3">
                {plant.messages.slice(0, 10).map((message) => (
                  <div key={message.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      message.direction === 'OUTBOUND' ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {message.direction === 'OUTBOUND' ? 'Sent' : 'Received'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {message.channel}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{message.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No activity yet</p>
                <p className="text-sm">Activity will appear here as you interact with your plant</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
