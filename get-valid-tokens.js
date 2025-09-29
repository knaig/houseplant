const { PrismaClient } = require('@prisma/client')

async function getValidTokens() {
  console.log('🔍 SCRIPT: DATABASE_URL exists:', !!process.env.DATABASE_URL)
  console.log('🔍 SCRIPT: DATABASE_URL length:', process.env.DATABASE_URL?.length || 0)
  console.log('🔍 SCRIPT: FULL DATABASE_URL:', process.env.DATABASE_URL)
  console.log('🔍 SCRIPT: NODE_ENV:', process.env.NODE_ENV)
  
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
    
    console.log('Valid tokens:')
    tokens.forEach(token => {
      console.log(`- ${token.token} (expires: ${token.expiresAt})`)
    })
    
    if (tokens.length === 0) {
      console.log('No valid tokens found')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getValidTokens()
