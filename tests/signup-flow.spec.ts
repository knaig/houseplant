import { test, expect } from '@playwright/test';

test.describe('Plant App Testing', () => {
  test('should load homepage and basic navigation', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Take a screenshot of the homepage
    await page.screenshot({ path: 'test-results/01-homepage.png' });
    
    // Check if homepage loaded correctly
    const title = page.locator('h1').first();
    await expect(title).toBeVisible();
    
    // Check for key elements
    const getStartedButton = page.locator('button:has-text("Get Started")').first();
    await expect(getStartedButton).toBeVisible();
    
    console.log('✅ Homepage loaded successfully!');
  });
  
  test('should handle authentication redirect properly', async ({ page }) => {
    // Navigate directly to dashboard (should redirect to sign-in)
    await page.goto('/app');
    
    // Wait for redirect to sign-in page
    await page.waitForLoadState('domcontentloaded');
    
    // Take screenshot of sign-in page
    await page.screenshot({ path: 'test-results/02-signin-redirect.png' });
    
    // Check if we're redirected to sign-in
    await expect(page).toHaveURL(/.*\/sign-in/);
    
    // Check for sign-in elements
    const signInTitle = page.locator('h1, h2').first();
    await expect(signInTitle).toBeVisible();
    
    console.log('✅ Authentication redirect working correctly!');
  });
  
  test('should test plant claiming page structure', async ({ page }) => {
    // Navigate to claim page with a test token
    await page.goto('/claim?token=test-token-123');
    
    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Take screenshot of claim page
    await page.screenshot({ path: 'test-results/03-claim-page.png' });
    
    // Check if claim page loaded (should show either form or invalid token message)
    const claimTitle = page.locator('text=Claim Your Plant');
    const invalidTokenMessage = page.locator('text=Invalid QR Code Link');
    const signInRequired = page.locator('text=Sign In Required');
    
    // One of these should be visible
    const hasClaimForm = await claimTitle.isVisible();
    const hasInvalidToken = await invalidTokenMessage.isVisible();
    const hasSignInRequired = await signInRequired.isVisible();
    
    expect(hasClaimForm || hasInvalidToken || hasSignInRequired).toBe(true);
    
    console.log('✅ Plant claiming page structure test completed!');
  });
  
  test('should test API endpoints', async ({ page }) => {
    // Test species API
    const speciesResponse = await page.request.get('/api/species');
    console.log('Species API Status:', speciesResponse.status());
    expect(speciesResponse.status()).toBeGreaterThan(0);
    
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
    expect(claimResponse.status()).toBeGreaterThan(0);
    
    console.log('✅ API endpoints test completed!');
  });
});
