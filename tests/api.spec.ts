import { test, expect } from '@playwright/test'

test.describe('API Endpoints', () => {
  test('should fetch categories successfully', async ({ request }) => {
    const response = await request.get('/api/categories')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('categories')
    expect(Array.isArray(data.categories)).toBe(true)
  })

  test('should fetch products successfully', async ({ request }) => {
    const response = await request.get('/api/products?limit=10&status=active')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('products')
    expect(Array.isArray(data.products)).toBe(true)
  })

  test('should require authentication for protected endpoints', async ({ request }) => {
    const response = await request.get('/api/user/profile')
    expect(response.status()).toBe(401)
    
    const data = await response.json()
    expect(data).toHaveProperty('error')
  })

  test('should handle invalid product requests', async ({ request }) => {
    const response = await request.get('/api/products/invalid-id')
    expect(response.status()).toBe(404)
    
    const data = await response.json()
    expect(data).toHaveProperty('error', 'Product not found')
  })
})

test.describe('Page Loading', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Trichy Fresh Connect')).toBeVisible()
  })

  test('should load browse page successfully', async ({ page }) => {
    await page.goto('/browse')
    
    // Should show either products or "no products" message
    const contentCheck = page.locator('h1, text="No products found"')
    await expect(contentCheck.first()).toBeVisible({ timeout: 10000 })
  })

  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to signin
    await expect(page).toHaveURL(/\/auth\/signin/)
  })
})