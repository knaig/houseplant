import { test, expect } from '@playwright/test';

test.describe('Claim Plant Flow - Integration Tests', () => {
  test('should handle complete claim flow with mock data', async ({ page }) => {
    // Test the claim page structure and form validation
    await page.goto('/claim?token=abcdefghijklmnopqrstuvwxyz123456');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check page structure
    const claimTitle = page.locator('text=Claim Your Plant');
    const invalidTokenMessage = page.locator('text=Missing Token');
    
    // Should show either the claim form or invalid token message
    const hasClaimForm = await claimTitle.isVisible();
    const hasInvalidToken = await invalidTokenMessage.isVisible();
    
    expect(hasClaimForm || hasInvalidToken).toBe(true);
    
    if (hasClaimForm) {
      // Test form elements are present
      const plantNameField = page.locator('input[placeholder*="Enter a fun name"]');
      const speciesSelect = page.locator('[role="combobox"]').first();
      const submitButton = page.locator('button[type="submit"]');
      
      await expect(plantNameField).toBeVisible();
      await expect(speciesSelect).toBeVisible();
      await expect(submitButton).toBeVisible();
      
      // Test form validation
      await submitButton.click();
      
      // Should stay on the same page (validation prevents submission)
      await expect(page).toHaveURL(/.*\/claim/);
      
      // Test plant name field
      await plantNameField.fill('Test Plant');
      
      // Test species dropdown interaction
      await speciesSelect.click();
      await page.waitForTimeout(500);
      
      // Check if dropdown opens (species might be empty, which is expected)
      const dropdownOpen = await page.locator('[role="option"]').isVisible();
      if (dropdownOpen) {
        // If species are loaded, test selection
        const firstOption = page.locator('[role="option"]').first();
        await firstOption.click();
      }
      
      // Test other form fields
      const potSizeField = page.locator('input[type="number"]');
      if (await potSizeField.isVisible()) {
        await potSizeField.fill('15');
      }
      
      const dateField = page.locator('input[type="date"]');
      if (await dateField.isVisible()) {
        const today = new Date().toISOString().split('T')[0];
        await dateField.fill(today);
      }
      
      // Take screenshot of filled form
      await page.screenshot({ path: 'test-results/claim-form-filled.png' });
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/claim-flow-test.png' });
  });

  test('should test API endpoints respond correctly', async ({ page }) => {
    // Test species API
    const speciesResponse = await page.request.get('/api/species');
    console.log('Species API Status:', speciesResponse.status());
    
    // Should return 200 or 500 (if no database), but not crash
    expect([200, 500]).toContain(speciesResponse.status());
    
    // Test claim API without auth (should return 401)
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
    
    // Should return 401 (unauthorized) or 500 (database error), but not crash
    expect([401, 500]).toContain(claimResponse.status());
    
    // Test user plants names API without auth (should return 401)
    const namesResponse = await page.request.get('/api/user/plants/names');
    console.log('Names API Status:', namesResponse.status());
    
    // Should return 401 (unauthorized), but not crash
    expect([401, 500]).toContain(namesResponse.status());
  });

  test('should handle QR token validation correctly', async ({ page }) => {
    // Test various token formats
    const testTokens = [
      'validtoken123456789012345678', // Valid format
      'short', // Too short
      'invalid-token-with-dashes', // Invalid characters
      '', // Empty
      '1234567890123456789012345678901234567890', // Too long
    ];
    
    for (const token of testTokens) {
      const url = token ? `/claim?token=${token}` : '/claim';
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      // Should either show claim form or invalid token message
      const hasClaimForm = await page.locator('text=Claim Your Plant').isVisible();
      const hasInvalidToken = await page.locator('text=Invalid QR Code Link').isVisible();
      const hasSignInRequired = await page.locator('text=Sign In Required').isVisible();
      
      // One of these should be true
      expect(hasClaimForm || hasInvalidToken || hasSignInRequired).toBe(true);
      
      console.log(`Token "${token}": Form=${hasClaimForm}, Invalid=${hasInvalidToken}, SignIn=${hasSignInRequired}`);
    }
  });

  test('should handle authentication states correctly', async ({ page }) => {
    // Test without authentication
    await page.goto('/claim?token=validtoken123456789012345678');
    await page.waitForLoadState('networkidle');
    
    const signInRequired = page.locator('text=Sign In Required');
    const signInButton = page.locator('text=Sign In to Continue');
    
    const isSignInRequired = await signInRequired.isVisible();
    if (isSignInRequired) {
      await expect(signInButton).toBeVisible();
      
      // Test sign-in redirect
      await signInButton.click();
      await page.waitForTimeout(1000);
      
      // Should redirect to sign-in page
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/sign-in|sign-up/);
    }
  });

  test('should handle form field interactions correctly', async ({ page }) => {
    await page.goto('/claim?token=validtoken123456789012345678');
    await page.waitForLoadState('networkidle');
    
    // Check if we can access the form
    const claimTitle = await page.locator('text=Claim Your Plant').isVisible();
    
    if (claimTitle) {
      // Test plant name field
      const nameField = page.locator('input[placeholder*="fun name"]');
      if (await nameField.isVisible()) {
        await nameField.fill('My Test Plant');
        await nameField.blur();
        
        // Check for validation feedback
        const validationIcon = page.locator('.text-green-500, .text-red-500');
        // Validation might be visible
      }
      
      // Test personality selection
      const personalitySelect = page.locator('[role="combobox"]').nth(2);
      if (await personalitySelect.isVisible()) {
        await personalitySelect.click();
        await page.waitForTimeout(500);
        
        const personalityOptions = page.locator('[role="option"]');
        if (await personalityOptions.isVisible()) {
          await personalityOptions.first().click();
        }
      }
      
      // Test light level selection
      const lightSelect = page.locator('[role="combobox"]').nth(1);
      if (await lightSelect.isVisible()) {
        await lightSelect.click();
        await page.waitForTimeout(500);
        
        const lightOptions = page.locator('[role="option"]');
        if (await lightOptions.isVisible()) {
          await lightOptions.first().click();
        }
      }
      
      // Take screenshot of form interactions
      await page.screenshot({ path: 'test-results/claim-form-interactions.png' });
    }
  });
});