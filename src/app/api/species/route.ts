import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const species = await db.species.findMany({
      orderBy: { commonName: 'asc' },
    })
    
    return NextResponse.json(species)
  } catch (error) {
    console.error('Error fetching species:', error)
    return NextResponse.json({ error: 'Failed to fetch species' }, { status: 500 })
  }
}
