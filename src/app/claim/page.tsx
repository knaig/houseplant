import { ClaimPageContent } from "./client"
import { db } from "@/lib/db"

// Validate token before showing the form
export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const params = await searchParams
  const token = params.token

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Missing Token</h1>
          <p className="text-gray-600 mb-4">No QR code token was provided. Please scan a valid QR code to claim your plant.</p>
          <a href="/" className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Back to Home</a>
        </div>
      </div>
    )
  }

  // Validate token exists and is not expired/redeemed
  try {
    const tokenResult = await db.$queryRaw`
      SELECT id, token, "expiresAt", "redeemedByUserId"
      FROM "ClaimToken"
      WHERE token = ${token}
      LIMIT 1
    `

    const claimToken = Array.isArray(tokenResult) && tokenResult.length > 0 ? tokenResult[0] : null

    if (!claimToken) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Invalid Token</h1>
            <p className="text-gray-600 mb-4">The QR code token "{token}" is not valid or does not exist.</p>
            <a href="/" className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Back to Home</a>
          </div>
        </div>
      )
    }

    // Check if token is expired
    if (claimToken.expiresAt < new Date()) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-orange-600 mb-4">⏰ Token Expired</h1>
            <p className="text-gray-600 mb-4">This QR code token has expired. Please get a fresh QR code.</p>
            <a href="/" className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Back to Home</a>
          </div>
        </div>
      )
    }

    // Check if token is already redeemed
    if (claimToken.redeemedByUserId) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-purple-600 mb-4">✅ Already Claimed</h1>
            <p className="text-gray-600 mb-4">This QR code has already been used to claim a plant.</p>
            <a href="/" className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Back to Home</a>
          </div>
        </div>
      )
    }

    // Token is valid - show the claim form
    return <ClaimPageContent token={token} />
    
  } catch (error) {
    console.error('Error validating token:', error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">⚠️ Validation Error</h1>
          <p className="text-gray-600 mb-4">Unable to validate the QR code token. Please try again.</p>
          <a href="/" className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Back to Home</a>
        </div>
      </div>
    )
  }
}
