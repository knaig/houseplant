const { PrismaClient } = require('@prisma/client')

async function checkCloudDatabase() {
  console.log('🔍 CLOUD DB: DATABASE_URL exists:', !!process.env.DATABASE_URL)
  console.log('🔍 CLOUD DB: DATABASE_URL length:', process.env.DATABASE_URL?.length || 0)
  console.log('🔍 CLOUD DB: FULL DATABASE_URL:', process.env.DATABASE_URL)
  
  const prisma = new PrismaClient()
  
  try {
    const tokens = await prisma.claimToken.findMany({
      where: {
        redeemedByUserId: null,
        expiresAt: {
          gt: new Date()
        }
      },
      select: {
        token: true,
        expiresAt: true
      },
      take: 5
    })
    
    console.log('🔍 CLOUD DB: Valid tokens found:', tokens.length)
    tokens.forEach(token => {
      console.log(`- ${token.token} (expires: ${token.expiresAt})`)
    })
    
    if (tokens.length === 0) {
      console.log('🔍 CLOUD DB: No valid tokens found')
    }
    
  } catch (error) {
    console.error('🔍 CLOUD DB: Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCloudDatabase()
