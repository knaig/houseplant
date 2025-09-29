import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'

export default async function HomePage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const user = await currentUser()
  const params = await searchParams
  const error = params.error

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header - 8px Grid System */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-base">🌱</span>
            </div>
            <span className="font-bold text-base sm:text-xl">
              <span className="sm:hidden">Plant Texts</span>
              <span className="hidden sm:inline">Text From Your Plants</span>
            </span>
          </div>
          
          <nav className="flex items-center space-x-3 sm:space-x-4">
            {user ? (
              <>
                <Link href="/app">
                  <Button variant="outline" className="text-sm sm:text-base h-10 sm:h-11 px-4 sm:px-6">
                    <span className="sm:hidden">App</span>
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <SignInButton>
                  <Button variant="ghost" className="text-sm sm:text-base h-10 sm:h-11 px-4 sm:px-6">
                    <span className="sm:hidden">Sign In</span>
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button className="text-sm sm:text-base h-10 sm:h-11 px-4 sm:px-6">
                    <span className="sm:hidden">Start</span>
                    <span className="hidden sm:inline">Get Started</span>
                  </Button>
                </SignUpButton>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Error Messages */}
      {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-md mx-auto">
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="text-center pb-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">❌</span>
                </div>
                <CardTitle className="text-red-800">
                  {error === 'invalid-token' && 'Invalid QR Code'}
                  {error === 'missing-token' && 'Missing QR Code'}
                  {error === 'expired-token' && 'Expired QR Code'}
                  {error === 'used-token' && 'QR Code Already Used'}
                  {error === 'validation-failed' && 'Validation Failed'}
                </CardTitle>
                <CardDescription className="text-red-600">
                  {error === 'invalid-token' && 'This QR code is not valid. Please scan a valid QR code from your plant pot.'}
                  {error === 'missing-token' && 'No QR code was provided. Please scan a QR code to claim your plant.'}
                  {error === 'expired-token' && 'This QR code has expired. Please contact support for a new code.'}
                  {error === 'used-token' && 'This QR code has already been used to claim a plant.'}
                  {error === 'validation-failed' && 'Unable to validate QR code. Please try again or contact support.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <Link href="/">
                  <Button variant="outline">
                    Back to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Hero Section - 8px Grid & Visual Hierarchy */}
      <section className="container mx-auto px-4 py-12 sm:px-6 sm:py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 sm:mb-8 text-sm sm:text-base px-4 py-2">
            🌿 Plant Care Made Simple
          </Badge>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
            <span className="sm:hidden">Plants Text You When Thirsty</span>
            <span className="hidden sm:inline">Your Plants Will Text You When They're Thirsty</span>
          </h1>
          <p className="text-base sm:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
            <span className="sm:hidden">Scan QR → Choose personality → Get WhatsApp reminders</span>
            <span className="hidden sm:inline">Revolutionary plant care made simple. Scan a QR sticker, choose your plant's personality, and receive personalized WhatsApp messages.</span>
          </p>
          
          {/* Simplified Steps - 8px Grid */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 sm:p-8 mb-8 sm:mb-12 max-w-4xl mx-auto">
            <h3 className="text-lg sm:text-xl font-semibold text-green-800 mb-6 sm:mb-8">🚀 How It Works:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 text-left">
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-green-700"><strong>1. Sign Up:</strong> <span className="sm:hidden">Free account</span><span className="hidden sm:inline">Create your free account</span></p>
                <p className="text-sm sm:text-base text-green-700"><strong>2. Scan QR:</strong> <span className="sm:hidden">Phone camera</span><span className="hidden sm:inline">Use your phone camera</span></p>
              </div>
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-green-700"><strong>3. Choose Style:</strong> <span className="sm:hidden">Plant personality</span><span className="hidden sm:inline">Pick communication style</span></p>
                <p className="text-sm sm:text-base text-green-700"><strong>4. Get Messages:</strong> <span className="sm:hidden">WhatsApp reminders</span><span className="hidden sm:inline">Receive WhatsApp reminders</span></p>
              </div>
            </div>
          </div>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <SignUpButton>
                <Button size="lg" className="w-full sm:w-auto h-14 sm:h-16 text-lg font-medium px-8">
                  Start Free Trial
                </Button>
              </SignUpButton>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 sm:h-16 text-lg px-8">
                Watch Demo
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works - 8px Grid & Visual Hierarchy */}
      <section className="container mx-auto px-4 py-16 sm:px-6 sm:py-24">
        <h2 className="text-2xl sm:text-4xl font-bold text-center mb-12 sm:mb-16">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
          <Card className="text-center">
            <CardHeader className="pb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl sm:text-3xl">📱</span>
              </div>
              <CardTitle className="text-lg sm:text-xl">1. Scan QR</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm sm:text-base">
                <span className="sm:hidden">Point camera at QR sticker</span>
                <span className="hidden sm:inline">Point your phone camera at the QR sticker on your plant pot</span>
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl sm:text-3xl">🌱</span>
              </div>
              <CardTitle className="text-lg sm:text-xl">2. Choose Style</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm sm:text-base">
                <span className="sm:hidden">Pick personality: Funny, Zen, Coach, Classic</span>
                <span className="hidden sm:inline">Pick how your plant communicates: Funny, Zen, Coach, or Classic</span>
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl sm:text-3xl">💬</span>
              </div>
              <CardTitle className="text-lg sm:text-xl">3. Get Messages</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm sm:text-base">
                <span className="sm:hidden">WhatsApp reminders when thirsty</span>
                <span className="hidden sm:inline">Receive personalized WhatsApp messages when your plant needs water</span>
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing - 8px Grid & Visual Hierarchy */}
      <section className="container mx-auto px-4 py-20 sm:px-6 sm:py-24 bg-white">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8">Simple Pricing</h2>
        <p className="text-center text-gray-600 mb-16 sm:mb-20 max-w-3xl mx-auto text-lg sm:text-xl">
          Choose the plan that fits your plant collection. All plans include WhatsApp messaging and plant personalities.
        </p>
        <div className="grid md:grid-cols-3 gap-8 sm:gap-12 max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Perfect for trying out</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">₹0</div>
              <ul className="space-y-2 mb-6">
                <li>✓ <strong>1 plant</strong> - Perfect for beginners</li>
                <li>✓ <strong>WhatsApp messages</strong> - Never forget to water</li>
                <li>✓ <strong>All personalities</strong> - Funny, Coach, Zen, Classic</li>
                <li>✓ <strong>Basic dashboard</strong> - Track your plant's health</li>
                <li>✓ <strong>QR code scanning</strong> - Easy plant setup</li>
              </ul>
              <SignUpButton>
                <Button className="w-full">Get Started</Button>
              </SignUpButton>
            </CardContent>
          </Card>

          <Card className="border-green-500">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>Perfect for plant lovers with multiple green friends</CardDescription>
              <Badge className="w-fit">Most Popular</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">₹4.99<span className="text-lg text-gray-500">/month</span></div>
              <ul className="space-y-2 mb-6">
                <li>✓ <strong>Up to 10 plants</strong> - Perfect for plant enthusiasts</li>
                <li>✓ <strong>WhatsApp messages</strong> - Personalized for each plant</li>
                <li>✓ <strong>All personalities</strong> - Choose the perfect voice</li>
                <li>✓ <strong>Advanced dashboard</strong> - Detailed plant analytics</li>
                <li>✓ <strong>Priority support</strong> - Get help when you need it</li>
                <li>✓ <strong>Plant history</strong> - Track watering patterns</li>
              </ul>
              <SignUpButton>
                <Button className="w-full">Start Pro Trial</Button>
              </SignUpButton>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pro Plus</CardTitle>
              <CardDescription>For plant collectors and indoor garden enthusiasts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">₹9.99<span className="text-lg text-gray-500">/month</span></div>
              <ul className="space-y-2 mb-6">
                <li>✓ <strong>Up to 25 plants</strong> - For serious plant collectors</li>
                <li>✓ <strong>WhatsApp messages</strong> - Personalized for each plant</li>
                <li>✓ <strong>All personalities</strong> - Choose the perfect voice</li>
                <li>✓ <strong>Advanced dashboard</strong> - Detailed plant analytics</li>
                <li>✓ <strong>Priority support</strong> - Get help when you need it</li>
                <li>✓ <strong>Plant analytics</strong> - Track growth and health trends</li>
                <li>✓ <strong>Export data</strong> - Download your plant history</li>
              </ul>
              <SignUpButton>
                <Button className="w-full">Start Pro Plus Trial</Button>
              </SignUpButton>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer - 8px Grid */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <div className="text-center text-gray-600">
            <p className="text-sm sm:text-base">&copy; 2024 Text From Your Plants. Made with 🌱 for plant lovers.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}