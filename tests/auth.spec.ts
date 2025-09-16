import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should allow user registration and login', async ({ page }) => {
    await page.goto('/')
    
    // Go to registration page
    await page.click('text=Sign Up')
    await expect(page).toHaveURL(/\/auth\/register/)
    
    // Fill registration form
    const timestamp = Date.now()
    const testEmail = `test${timestamp}@example.com`
    
    await page.fill('[name="name"]', 'Test User')
    await page.fill('[name="email"]', testEmail)
    await page.fill('[name="password"]', 'password123')
    await page.selectOption('[name="userType"]', 'consumer')
    
    // Submit registration
    await page.click('button[type="submit"]')
    
    // Should redirect after successful registration
    await expect(page).toHaveURL('/')
    
    // User should be logged in (check for user name in navigation)
    await expect(page.locator('text=Welcome, Test User')).toBeVisible()
    
    // Test logout
    await page.click('text=Sign Out')
    await expect(page).toHaveURL('/')
    await expect(page.locator('text=Sign In')).toBeVisible()
    
    // Test login
    await page.click('text=Sign In')
    await page.fill('[name="email"]', testEmail)
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Should redirect to homepage after login
    await expect(page).toHaveURL('/')
    await expect(page.locator('text=Welcome, Test User')).toBeVisible()
  })
  
  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/auth/signin')
    
    await page.fill('[name="email"]', 'invalid@example.com')
    await page.fill('[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible()
  })
})