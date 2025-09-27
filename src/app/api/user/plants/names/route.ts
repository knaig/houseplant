import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * GET /api/user/plants/names
 * Fetches the names of all plants belonging to the authenticated user
 * Used for uniqueness checking in the plant naming component
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from Clerk ID
    let user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        plants: {
          select: {
            name: true
          }
        }
      }
    });

    if (!user) {
      // Create user if doesn't exist
      user = await db.user.create({
        data: {
          clerkId: userId,
          email: '', // Will be updated when we get email from Clerk
        },
        select: {
          plants: {
            select: {
              name: true
            }
          }
        }
      });
    }

    // Extract just the names array
    const names = user.plants.map(plant => plant.name);

    // Return lightweight response with caching headers
    return NextResponse.json(
      { names },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=60', // Cache for 1 minute
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error fetching user plant names:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
