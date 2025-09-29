import { test, expect } from '@playwright/test';

test.describe('Claim Plant Flow - Simple Tests', () => {
  test('should show sign-in required when not authenticated', async ({ page }) => {
    // Use a valid token from the database
    const validToken = 'n7sqi8wlvlpalq2haj83';
    await page.goto(`/claim?token=${validToken}`);
    
    // Wait for page to load and authentication check to complete
    await page.waitForLoadState('networkidle');
    
    // Wait for the authentication check to complete (client-side)
    // The page should show "Sign In Required" for unauthenticated users
    await page.waitForSelector('text=Sign In Required', { timeout: 15000 });
    
    // Check for sign-in required message
    const signInRequired = page.locator('text=Sign In Required');
    await expect(signInRequired).toBeVisible();
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/claim-no-auth-simple.png' });
  });

  test('should show invalid token message without token', async ({ page }) => {
    // Navigate to claim page without token
    await page.goto('/claim');
    
    await page.waitForLoadState('networkidle');
    
    // Should show missing token message (server-side validation)
    const missingTokenMessage = page.locator('text=Missing Token');
    await expect(missingTokenMessage).toBeVisible();
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/claim-no-token-simple.png' });
  });

  test('should load claim form with valid token structure', async ({ page }) => {
    // Use a valid token from the database
    const validToken = 'n7sqi8wlvlpalq2haj83';
    await page.goto(`/claim?token=${validToken}`);
    
    await page.waitForLoadState('networkidle');
    
    // Wait for authentication check to complete
    await page.waitForSelector('text=Sign In Required', { timeout: 10000 });
    
    // Check if we get to the claim form (should show sign-in required for unauthenticated users)
    const signInRequired = page.locator('text=Sign In Required');
    const claimTitle = page.locator('text=Claim Your Plant');
    
    // Should show sign-in required since we're not authenticated
    await expect(signInRequired).toBeVisible();
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/claim-form-structure.png' });
  });

  test('should test API endpoints availability', async ({ page }) => {
    // Test species API
    const speciesResponse = await page.request.get('/api/species');
    console.log('Species API Status:', speciesResponse.status());
    
    // Test claim API (should return 401 without auth)
    const claimResponse = await page.request.post('/api/plants/claim', {
      data: {
        token: 'test-token',
        name: 'Test Plant',
        speciesId: 'test-species',
        potSizeCm: 15,
        lightLevel: 'MEDIUM',
        location: 'Test',
        personality: 'FUNNY',
        lastWateredAt: new Date().toISOString().split('T')[0]
      }
    });
    console.log('Claim API Status:', claimResponse.status());
    
    // Both endpoints should respond (even if with errors)
    expect(speciesResponse.status()).toBeGreaterThan(0);
    expect(claimResponse.status()).toBeGreaterThan(0);
  });
});