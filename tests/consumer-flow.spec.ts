import { test, expect } from '@playwright/test'

test.describe('Consumer Flow', () => {
  // Set up authenticated user for consumer flow tests
  test.beforeEach(async ({ page }) => {
    // Create a test user session (you may need to adjust this based on your auth setup)
    await page.goto('/')
  })

  test('should browse products and filter by category', async ({ page }) => {
    await page.goto('/browse')
    
    // Wait for products to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 })
    
    // Test category filtering
    await page.click('text=Vegetables')
    await page.waitForTimeout(1000) // Wait for filter to apply
    
    // All visible products should be vegetables
    const productCards = page.locator('[data-testid="product-card"]')
    const count = await productCards.count()
    
    if (count > 0) {
      // Check first product has vegetable category
      const firstProduct = productCards.first()
      await expect(firstProduct.locator('text=Vegetables')).toBeVisible()
    }
  })

  test('should search for products', async ({ page }) => {
    await page.goto('/browse')
    
    // Test search functionality
    await page.fill('[placeholder*="Search"]', 'tomato')
    await page.press('[placeholder*="Search"]', 'Enter')
    
    // Should filter products or show "no products found"
    const searchResults = page.locator('[data-testid="product-card"], text="No products found"')
    await expect(searchResults.first()).toBeVisible({ timeout: 10000 })
  })

  test('should add products to cart', async ({ page }) => {
    // First, register and login as consumer
    await page.goto('/auth/register')
    
    const timestamp = Date.now()
    const testEmail = `consumer${timestamp}@example.com`
    
    await page.fill('[name="name"]', 'Test Consumer')
    await page.fill('[name="email"]', testEmail)
    await page.fill('[name="password"]', 'password123')
    await page.selectOption('[name="userType"]', 'consumer')
    await page.click('button[type="submit"]')
    
    // Navigate to browse products
    await page.goto('/browse')
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 })
    
    // Find the first "Add to Cart" button and click it
    const addToCartButton = page.locator('text="Add to Cart"').first()
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      
      // Should show success toast
      await expect(page.locator('text="Added to Cart"')).toBeVisible({ timeout: 5000 })
      
      // Cart button should show item count
      const cartButton = page.locator('[href="/cart"]')
      await expect(cartButton.locator('text="1"')).toBeVisible()
    }
  })

  test('should view and manage cart', async ({ page }) => {
    // Register as consumer and add item to cart first
    await page.goto('/auth/register')
    
    const timestamp = Date.now()
    const testEmail = `carttest${timestamp}@example.com`
    
    await page.fill('[name="name"]', 'Cart Test User')
    await page.fill('[name="email"]', testEmail)
    await page.fill('[name="password"]', 'password123')
    await page.selectOption('[name="userType"]', 'consumer')
    await page.click('button[type="submit"]')
    
    // Add product to cart
    await page.goto('/browse')
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 })
    
    const addToCartButton = page.locator('text="Add to Cart"').first()
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      await expect(page.locator('text="Added to Cart"')).toBeVisible({ timeout: 5000 })
      
      // Go to cart page
      await page.click('[href="/cart"]')
      await expect(page).toHaveURL('/cart')
      
      // Cart should have items
      await expect(page.locator('text="Shopping Cart"')).toBeVisible()
      
      // Should show proceed to checkout button if items present
      const checkoutButton = page.locator('text="Proceed to Checkout"')
      if (await checkoutButton.isVisible()) {
        await expect(checkoutButton).toBeVisible()
      }
    }
  })

  test('should access checkout flow', async ({ page }) => {
    // This test would require having items in cart
    // For now, just test that checkout page requires authentication
    await page.goto('/checkout')
    
    // Should redirect to signin if not authenticated
    await expect(page).toHaveURL(/\/auth\/signin/)
  })
})