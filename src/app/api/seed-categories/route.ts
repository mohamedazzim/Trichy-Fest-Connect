import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { categories } from '@/lib/schema'

// GET and POST /api/seed-categories - One-time setup to seed categories
export async function GET() {
  return POST();
}

export async function POST() {
  try {
    console.log('Seeding categories for deployed database...')
    
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

    // Insert categories
    const results = []
    for (const category of categoryData) {
      try {
        await db
          .insert(categories)
          .values({
            ...category,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .onConflictDoNothing()
        
        results.push({ id: category.id, status: 'inserted' })
        console.log(`✓ Category ${category.id} added`)
      } catch (error) {
        console.log(`Category ${category.id} already exists:`, error)
        results.push({ id: category.id, status: 'already exists' })
      }
    }

    console.log('Categories seeding completed successfully!')

    return NextResponse.json({
      success: true,
      message: `Categories seeded successfully! Added ${results.length} categories.`,
      categories: results,
      total: categoryData.length
    })

  } catch (error) {
    console.error('Error seeding categories:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to seed categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}