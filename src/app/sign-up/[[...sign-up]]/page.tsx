import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🌱</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Plant Care</h1>
          <p className="text-gray-600">
            Create your account to start receiving WhatsApp messages from your plants
          </p>
        </div>
        
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-green-600 hover:bg-green-700 text-white',
              card: 'shadow-lg border-0',
              headerTitle: 'text-gray-900',
              headerSubtitle: 'text-gray-600',
            }
          }}
          redirectUrl="/app"
        />
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <a href="/sign-in" className="text-green-600 hover:underline font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
