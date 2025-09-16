import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { categories } from '@/lib/schema'

// POST /api/seed-categories - One-time setup to seed categories
export async function POST() {
  try {
    console.log('Seeding categories...')
    
    const categoryData = [
      {
        id: 'vegetables',
        name: 'Vegetables',
        description: 'Fresh vegetables including leafy greens, root vegetables, and seasonal produce',
        image: null,
      },
      {
        id: 'fruits',
        name: 'Fruits',
        description: 'Fresh seasonal fruits including tropical and local varieties',
        image: null,
      },
      {
        id: 'herbs-spices',
        name: 'Herbs & Spices',
        description: 'Fresh herbs, spices, and aromatic plants for cooking',
        image: null,
      },
      {
        id: 'dairy-eggs',
        name: 'Dairy & Eggs',
        description: 'Fresh milk, eggs, and dairy products from local farms',
        image: null,
      },
      {
        id: 'grains-pulses',
        name: 'Grains & Pulses',
        description: 'Rice, lentils, beans, and other grains grown locally',
        image: null,
      },
      {
        id: 'organic',
        name: 'Organic Produce',
        description: 'Certified organic fruits, vegetables, and other produce',
        image: null,
      },
      {
        id: 'flowers',
        name: 'Flowers',
        description: 'Fresh flowers and ornamental plants',
        image: null,
      },
      {
        id: 'seasonal-specials',
        name: 'Seasonal Specials',
        description: 'Limited time seasonal produce and specialty items',
        image: null,
      },
    ]

    // Insert categories one by one to handle conflicts gracefully
    const results = []
    for (const category of categoryData) {
      try {
        const result = await db
          .insert(categories)
          .values({
            ...category,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .onConflictDoNothing()
        
        results.push({ id: category.id, status: 'inserted' })
      } catch (error) {
        console.log(`Category ${category.id} already exists or error:`, error)
        results.push({ id: category.id, status: 'skipped' })
      }
    }

    console.log('Categories seeding completed:', results)

    return NextResponse.json({
      message: 'Categories seeded successfully',
      results: results,
      total: categoryData.length
    })

  } catch (error) {
    console.error('Error seeding categories:', error)
    return NextResponse.json({ error: 'Failed to seed categories' }, { status: 500 })
  }
}

// GET method for easier browser access
export async function GET() {
  return POST();
}