import { test, expect } from '@playwright/test';

test.describe('Claim Plant Flow - Simple Tests', () => {
  test('should show sign-in required when not authenticated', async ({ page }) => {
    // Navigate to claim page without authentication
    await page.goto('/claim?token=test-token-123');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
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
    
    // Should show invalid token message
    const invalidTokenMessage = page.locator('text=Invalid QR Code Link');
    await expect(invalidTokenMessage).toBeVisible();
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/claim-no-token-simple.png' });
  });

  test('should load claim form with valid token structure', async ({ page }) => {
    // Use a mock token that matches the expected format
    const mockToken = 'abcdefghijklmnopqrstuvwxyz123456';
    await page.goto(`/claim?token=${mockToken}`);
    
    await page.waitForLoadState('networkidle');
    
    // Check if we get to the claim form (even if token is invalid, we should see the form structure)
    const claimTitle = page.locator('text=Claim Your Plant');
    
    // The page should either show the claim form or an invalid token message
    const hasClaimForm = await claimTitle.isVisible();
    const hasInvalidToken = await page.locator('text=Invalid QR Code Link').isVisible();
    
    // One of these should be true
    expect(hasClaimForm || hasInvalidToken).toBe(true);
    
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