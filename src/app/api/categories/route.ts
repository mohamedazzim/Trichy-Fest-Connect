import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { categories } from '@/lib/schema'

// GET /api/categories - List all categories
export async function GET() {
  try {
    console.log('Categories API: Starting database query...')
    const categoryList = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        image: categories.image,
      })
      .from(categories)
      .orderBy(categories.name)

    console.log('Categories API: Query completed. Found', categoryList.length, 'categories')
    console.log('Categories API: Category IDs:', categoryList.map(c => c.id))

    return NextResponse.json({
      categories: categoryList
    })

  } catch (error) {
    console.error('Categories API: Database query failed:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}