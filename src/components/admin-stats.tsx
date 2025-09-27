import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AdminStatsProps {
  userCount: number
  plantCount: number
  messageCount: number
  activeSubscriptions: number
}

export function AdminStats({ userCount, plantCount, messageCount, activeSubscriptions }: AdminStatsProps) {
  const conversionRate = userCount > 0 ? ((activeSubscriptions / userCount) * 100).toFixed(1) : '0'
  const avgPlantsPerUser = userCount > 0 ? (plantCount / userCount).toFixed(1) : '0'
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Plants</CardTitle>
          <span className="text-2xl">🌱</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{plantCount}</div>
          <p className="text-xs text-muted-foreground">
            Claimed plants
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
          <span className="text-2xl">💬</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{messageCount}</div>
          <p className="text-xs text-muted-foreground">
            WhatsApp messages
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          <span className="text-2xl">💳</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeSubscriptions}</div>
          <p className="text-xs text-muted-foreground">
            Paying customers
          </p>
        </CardContent>
      </Card>
      </div>
      
      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📊 Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <Badge variant="secondary">{conversionRate}%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Plants per User</span>
              <Badge variant="outline">{avgPlantsPerUser}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Messages per Plant</span>
              <Badge variant="outline">{plantCount > 0 ? (messageCount / plantCount).toFixed(1) : '0'}</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🎯 Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/admin/qr" className="block w-full text-left p-2 hover:bg-gray-50 rounded">
              📱 Generate QR Codes
            </a>
            <a href="/admin/users" className="block w-full text-left p-2 hover:bg-gray-50 rounded">
              👥 Manage Users
            </a>
            <a href="/admin/plants" className="block w-full text-left p-2 hover:bg-gray-50 rounded">
              🌱 Manage Plants
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
