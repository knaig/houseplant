import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function AdminPlants() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Plants</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Frank the Pothos</p>
              <p className="text-sm text-gray-600">Claimed 1 day ago</p>
            </div>
            <Badge variant="outline">😄 Funny</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Zen Master Snake Plant</p>
              <p className="text-sm text-gray-600">Claimed 3 days ago</p>
            </div>
            <Badge variant="outline">🧘‍♀️ Zen</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Motivational Monstera</p>
              <p className="text-sm text-gray-600">Claimed 1 week ago</p>
            </div>
            <Badge variant="outline">💪 Coach</Badge>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:underline">
            View All Plants
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
