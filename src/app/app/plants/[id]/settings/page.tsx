'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Personality, LightLevel } from '@prisma/client';

interface PlantSettingsPageProps {
  params: { id: string };
}

interface Plant {
  id: string;
  name: string;
  personality: Personality;
  lightLevel: LightLevel;
  location: string | null;
  potSizeCm: number;
  customWaterDays: number | null;
  species: {
    commonName: string;
    defaultWaterDays: number;
  };
}

const personalityOptions = [
  { value: 'FUNNY', label: '😄 Funny', description: 'Playful and humorous messages' },
  { value: 'COACH', label: '💪 Coach', description: 'Motivational and encouraging' },
  { value: 'ZEN', label: '🧘 Zen', description: 'Calm and peaceful' },
  { value: 'CLASSIC', label: '🌿 Classic', description: 'Traditional and straightforward' },
];

const lightLevelOptions = [
  { value: 'LOW', label: 'Low Light', description: 'Indirect or filtered light' },
  { value: 'MEDIUM', label: 'Medium Light', description: 'Bright, indirect light' },
  { value: 'HIGH', label: 'Bright Light', description: 'Direct or very bright light' },
];

export default function PlantSettingsPage({ params }: PlantSettingsPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Form state - these would normally be loaded from props or API
  const [formData, setFormData] = useState({
    personality: 'FUNNY' as Personality,
    lightLevel: 'MEDIUM' as LightLevel,
    location: '',
    potSizeCm: 15,
    customWaterDays: null as number | null,
  });

  const [originalData, setOriginalData] = useState(formData);

  // Mock plant data - in real implementation, this would come from props or API call
  const plant: Plant = {
    id: params.id,
    name: 'My Plant',
    personality: 'FUNNY',
    lightLevel: 'MEDIUM',
    location: 'Living Room',
    potSizeCm: 15,
    customWaterDays: null,
    species: {
      commonName: 'Snake Plant',
      defaultWaterDays: 7,
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/plants/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update plant settings');
      }

      const result = await response.json();
      
      toast.success('Plant settings updated successfully!');
      setOriginalData(formData);
      setHasChanges(false);
      
      // Redirect to plant detail page
      router.push(`/app/plants/${params.id}`);
      
    } catch (error) {
      console.error('Error updating plant:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update plant settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(originalData);
    setHasChanges(false);
  };

  const handleCancel = () => {
    router.push(`/app/plants/${params.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/app/plants/${params.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Plant
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Plant Settings</h1>
              <p className="text-lg text-gray-600 mt-1">
                Customize {plant.name}'s care preferences
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!hasChanges || isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Core plant details and identification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Plant Name</Label>
                <Input 
                  id="name"
                  value={plant.name}
                  disabled
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Plant name cannot be changed here
                </p>
              </div>

              <div>
                <Label htmlFor="species">Species</Label>
                <Input 
                  id="species"
                  value={plant.species.commonName}
                  disabled
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Species cannot be changed
                </p>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Living Room, Kitchen Window"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Where is this plant located?
                </p>
              </div>

              <div>
                <Label htmlFor="potSize">Pot Size (cm)</Label>
                <Input 
                  id="potSize"
                  type="number"
                  min="10"
                  max="100"
                  value={formData.potSizeCm}
                  onChange={(e) => handleInputChange('potSizeCm', parseInt(e.target.value))}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Diameter of the pot in centimeters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Care Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Care Settings</CardTitle>
              <CardDescription>
                Customize how your plant communicates and its care schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="personality">Personality</Label>
                <Select 
                  value={formData.personality} 
                  onValueChange={(value) => handleInputChange('personality', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {personalityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  How your plant will communicate with you
                </p>
              </div>

              <div>
                <Label htmlFor="lightLevel">Light Level</Label>
                <Select 
                  value={formData.lightLevel} 
                  onValueChange={(value) => handleInputChange('lightLevel', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lightLevelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  The lighting conditions where your plant lives
                </p>
              </div>

              <div>
                <Label htmlFor="customWaterDays">Custom Watering Interval (days)</Label>
                <Input 
                  id="customWaterDays"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.customWaterDays || ''}
                  onChange={(e) => handleInputChange('customWaterDays', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder={`Default: ${plant.species.defaultWaterDays} days`}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Override the species default ({plant.species.defaultWaterDays} days). Leave empty to use species default.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Settings */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
            <CardDescription>
              Additional options and information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">About Custom Watering Intervals</h4>
                <p className="text-sm text-blue-800">
                  Setting a custom watering interval will override the species default. This is useful if your plant 
                  has specific needs or if you've learned through experience that it prefers a different schedule. 
                  The system will use this interval for all future watering calculations and reminders.
                </p>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Moisture Bias</h4>
                <p className="text-sm text-yellow-800">
                  Your plant's moisture bias is automatically adjusted based on feedback. If you consistently 
                  water early or late, the system learns your plant's preferences and adjusts the schedule accordingly.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  disabled={!hasChanges || isLoading}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
