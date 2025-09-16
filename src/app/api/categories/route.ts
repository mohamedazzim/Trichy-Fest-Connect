import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { categories } from '@/lib/schema'

// GET /api/categories - List all categories
export async function GET() {
  try {
    const categoryList = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        image: categories.image,
      })
      .from(categories)
      .orderBy(categories.name)

    return NextResponse.json({
      categories: categoryList
    })

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}