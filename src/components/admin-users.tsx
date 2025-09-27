import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function AdminUsers() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">user@example.com</p>
              <p className="text-sm text-gray-600">Joined 2 days ago</p>
            </div>
            <Badge variant="default">Pro</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">plantlover@example.com</p>
              <p className="text-sm text-gray-600">Joined 1 week ago</p>
            </div>
            <Badge variant="secondary">Free</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">gardener@example.com</p>
              <p className="text-sm text-gray-600">Joined 2 weeks ago</p>
            </div>
            <Badge variant="default">Pro Plus</Badge>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:underline">
            View All Users
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
