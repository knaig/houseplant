import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'

export default async function HomePage() {
  const user = await currentUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🌱</span>
            </div>
            <span className="font-bold text-xl">Text From Your Plants</span>
          </div>
          
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/app">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <SignInButton>
                  <Button variant="ghost">Sign In</Button>
                </SignInButton>
                <SignUpButton>
                  <Button>Get Started</Button>
                </SignUpButton>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            🌿 Plant Care Made Simple
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your Plants Will Text You When They're Thirsty
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Revolutionary plant care made simple. Scan a QR sticker, choose your plant's personality, 
            and receive personalized WhatsApp messages. Your plants will never go thirsty again!
          </p>
          
          {/* Clear Step-by-Step Instructions */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold text-green-800 mb-4">🚀 How to Get Started:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <p className="text-green-700"><strong>1. Sign Up:</strong> Create your free account (no credit card required)</p>
                <p className="text-green-700"><strong>2. Scan QR Code:</strong> Use your phone to scan the QR sticker on your plant pot</p>
              </div>
              <div className="space-y-2">
                <p className="text-green-700"><strong>3. Choose Personality:</strong> Pick how your plant will communicate with you</p>
                <p className="text-green-700"><strong>4. Get Reminders:</strong> Receive WhatsApp messages when your plant needs care</p>
              </div>
            </div>
          </div>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignUpButton>
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </SignUpButton>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Watch Demo
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <CardTitle>1. Scan QR Sticker</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                <strong>Step 1:</strong> Each plant comes with a unique QR sticker. 
                <br/><br/>
                <strong>How to scan:</strong> Open your phone camera and point it at the QR code. 
                Tap the notification to open the claim page.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <CardTitle>2. Choose Personality</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                <strong>Step 2:</strong> Choose your plant's personality from 4 options:
                <br/><br/>
                <strong>• Funny:</strong> Playful and humorous messages<br/>
                <strong>• Coach:</strong> Motivational and encouraging<br/>
                <strong>• Zen:</strong> Calm and mindful<br/>
                <strong>• Classic:</strong> Simple and straightforward
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <CardTitle>3. Get Smart Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                <strong>Step 3:</strong> Get personalized WhatsApp messages based on:
                <br/><br/>
                <strong>• Plant species</strong> - Different plants have different needs<br/>
                <strong>• Pot size</strong> - Larger pots need less frequent watering<br/>
                <strong>• Light level</strong> - More light = more water needed<br/>
                <strong>• Your feedback</strong> - Reply "watered" on WhatsApp to adjust timing
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-16 bg-white">
        <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Choose the plan that fits your plant collection. All plans include WhatsApp messaging and plant personalities.
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Text From Your Plants. Made with 🌱 for plant lovers.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}