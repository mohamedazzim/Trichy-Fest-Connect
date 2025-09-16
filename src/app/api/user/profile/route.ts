import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name too long'),
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional(),
  location: z.string().max(255, 'Location too long').optional(),
  phone: z.string().max(20, 'Phone number too long').optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        bio: users.bio,
        location: users.location,
        phone: users.phone,
        userType: users.userType,
        image: users.image,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)
      .then((rows: any[]) => rows[0])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // CSRF protection - strict origin and referer validation
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    const host = request.headers.get('host')
    
    if (origin) {
      try {
        const originUrl = new URL(origin)
        if (originUrl.host !== host) {
          return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: 'Invalid origin format' }, { status: 403 })
      }
    } else if (referer) {
      try {
        const refererUrl = new URL(referer)
        if (refererUrl.host !== host) {
          return NextResponse.json({ error: 'Invalid referer' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: 'Invalid referer format' }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: 'Missing origin or referer header' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)
    const { name, bio, location, phone } = validatedData

    // Update user profile
    const updatedUser = await db
      .update(users)
      .set({
        name,
        bio,
        location,
        phone,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        bio: users.bio,
        location: users.location,
        phone: users.phone,
        userType: users.userType,
      })
      .then((rows: any[]) => rows[0])

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}