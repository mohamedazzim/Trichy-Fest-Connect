import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { validateCSRF, createCSRFError } from '@/lib/csrf'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  userType: z.enum(['producer', 'consumer']),
})

export async function POST(request: NextRequest) {
  try {
    // CRITICAL SECURITY: CSRF protection for user registration
    const csrfResult = validateCSRF(request)
    if (!csrfResult.isValid) {
      const error = createCSRFError(csrfResult)
      return NextResponse.json({ 
        error: error.error,
        details: error.details 
      }, { status: error.status })
    }

    const body = await request.json()
    const { name, email, password, userType } = registerSchema.parse(body)
    const normalizedEmail = email.toLowerCase()

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1)
      .then((rows: any[]) => rows[0])

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        name,
        email: normalizedEmail,
        password: hashedPassword,
        userType,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        userType: users.userType,
      })
      .then((rows: any[]) => rows[0])

    return NextResponse.json(
      { message: 'User created successfully', user: newUser },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}