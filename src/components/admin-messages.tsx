import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function AdminMessages() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <p className="font-medium">Outbound WhatsApp</p>
              <p className="text-sm text-gray-600">&quot;yo it&apos;s Frank 🌿 i&apos;m parched like a biscuit...&quot;</p>
              <p className="text-xs text-gray-500">Sent 2 hours ago</p>
            </div>
            <Badge variant="outline">WhatsApp</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <p className="font-medium">Inbound WhatsApp</p>
              <p className="text-sm text-gray-600">&ldquo;watered&rdquo;</p>
              <p className="text-xs text-gray-500">Received 1 hour ago</p>
            </div>
            <Badge variant="outline">WhatsApp</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <p className="font-medium">Outbound WhatsApp</p>
              <p className="text-sm text-gray-600">&ldquo;Hydration check! Zen Master thrives when you stay consistent...&rdquo;</p>
              <p className="text-xs text-gray-500">Sent 4 hours ago</p>
            </div>
            <Badge variant="outline">WhatsApp</Badge>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:underline">
            View All Messages
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
