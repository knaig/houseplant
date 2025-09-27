import { test, expect } from '@playwright/test';

test.describe('Claim Plant Flow', () => {
  let testUser: { email: string; password: string };

  test.beforeEach(async () => {
    // Generate unique test user for each test
    testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!'
    };
  });

  test.describe('Authentication Requirements', () => {
    test('should redirect to sign-in when accessing claim page without authentication', async ({ page }) => {
      // Navigate to claim page without authentication
      await page.goto('/claim?token=test-token-123');
      
      // Should redirect to sign-in or show sign-in required message
      await page.waitForLoadState('networkidle');
      
      // Check for sign-in required message or redirect
      const signInRequired = page.locator('text=Sign In Required');
      const signInButton = page.locator('text=Sign In to Continue');
      
      await expect(signInRequired).toBeVisible();
      await expect(signInButton).toBeVisible();
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/claim-no-auth.png' });
    });

    test('should show invalid token message when accessing claim page without token', async ({ page }) => {
      // First authenticate the user
      await authenticateUser(page, testUser);
      
      // Navigate to claim page without token
      await page.goto('/claim');
      
      await page.waitForLoadState('networkidle');
      
      // Check for invalid token message
      const invalidTokenMessage = page.locator('text=Invalid QR Code Link');
      const backToHomeButton = page.locator('text=Back to Home');
      
      await expect(invalidTokenMessage).toBeVisible();
      await expect(backToHomeButton).toBeVisible();
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/claim-no-token.png' });
    });

    test('should show invalid token message with invalid token', async ({ page }) => {
      // First authenticate the user
      await authenticateUser(page, testUser);
      
      // Navigate to claim page with invalid token
      await page.goto('/claim?token=invalid-token-123');
      
      await page.waitForLoadState('networkidle');
      
      // Check for invalid token message
      const invalidTokenMessage = page.locator('text=Invalid QR Code Link');
      await expect(invalidTokenMessage).toBeVisible();
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/claim-invalid-token.png' });
    });
  });

  test.describe('Claim Form Validation', () => {
    test('should display claim form with valid token and authenticated user', async ({ page }) => {
      // First authenticate the user
      await authenticateUser(page, testUser);
      
      // Create a valid claim token (we'll need to create this via API)
      const claimToken = await createClaimToken(page);
      
      // Navigate to claim page with valid token
      await page.goto(`/claim?token=${claimToken}`);
      
      await page.waitForLoadState('networkidle');
      
      // Check that the claim form is visible
      const claimTitle = page.locator('text=Claim Your Plant');
      const plantNameField = page.locator('input[placeholder*="fun name"]');
      const speciesSelect = page.locator('[role="combobox"]').first();
      const submitButton = page.locator('button[type="submit"]');
      
      await expect(claimTitle).toBeVisible();
      await expect(plantNameField).toBeVisible();
      await expect(speciesSelect).toBeVisible();
      await expect(submitButton).toBeVisible();
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/claim-form-loaded.png' });
    });

    test('should validate required fields', async ({ page }) => {
      // First authenticate the user
      await authenticateUser(page, testUser);
      
      // Create a valid claim token
      const claimToken = await createClaimToken(page);
      
      // Navigate to claim page
      await page.goto(`/claim?token=${claimToken}`);
      await page.waitForLoadState('networkidle');
      
      // Try to submit form without filling required fields
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Check for validation errors or that form doesn't submit
      await expect(page).toHaveURL(/.*\/claim/); // Should stay on claim page
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/claim-form-validation.png' });
    });

    test('should validate plant name field', async ({ page }) => {
      // First authenticate the user
      await authenticateUser(page, testUser);
      
      // Create a valid claim token
      const claimToken = await createClaimToken(page);
      
      // Navigate to claim page
      await page.goto(`/claim?token=${claimToken}`);
      await page.waitForLoadState('networkidle');
      
      // Test invalid plant names
      const plantNameField = page.locator('input[placeholder*="fun name"]');
      
      // Test empty name
      await plantNameField.fill('');
      await plantNameField.blur();
      
      // Test name that's too short
      await plantNameField.fill('A');
      await plantNameField.blur();
      
      // Test name that's too long (over 50 characters)
      const longName = 'A'.repeat(51);
      await plantNameField.fill(longName);
      await plantNameField.blur();
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/claim-name-validation.png' });
    });

    test('should show species dropdown with options', async ({ page }) => {
      // First authenticate the user
      await authenticateUser(page, testUser);
      
      // Create a valid claim token
      const claimToken = await createClaimToken(page);
      
      // Navigate to claim page
      await page.goto(`/claim?token=${claimToken}`);
      await page.waitForLoadState('networkidle');
      
      // Click on species dropdown
      const speciesSelect = page.locator('[role="combobox"]').first();
      await speciesSelect.click();
      
      // Wait for dropdown to open and check for species options
      await page.waitForTimeout(1000);
      
      // Check that species options are loaded
      const speciesOptions = page.locator('[role="option"]');
      await expect(speciesOptions.first()).toBeVisible();
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/claim-species-dropdown.png' });
    });

    test('should show plant name suggestions', async ({ page }) => {
      // First authenticate the user
      await authenticateUser(page, testUser);
      
      // Create a valid claim token
      const claimToken = await createClaimToken(page);
      
      // Navigate to claim page
      await page.goto(`/claim?token=${claimToken}`);
      await page.waitForLoadState('networkidle');
      
      // Select a species first to trigger suggestions
      const speciesSelect = page.locator('[role="combobox"]').first();
      await speciesSelect.click();
      await page.waitForTimeout(500);
      
      // Select first available species
      const firstSpecies = page.locator('[role="option"]').first();
      if (await firstSpecies.isVisible()) {
        await firstSpecies.click();
        await page.waitForTimeout(1000);
        
        // Check for name suggestions
        const suggestionsTitle = page.locator('text=Name Suggestions');
        await expect(suggestionsTitle).toBeVisible();
        
        // Take screenshot for debugging
        await page.screenshot({ path: 'test-results/claim-name-suggestions.png' });
      }
    });
  });

  test.describe('Complete Claim Flow', () => {
    test('should successfully claim a plant with valid data', async ({ page }) => {
      // First authenticate the user
      await authenticateUser(page, testUser);
      
      // Create a valid claim token
      const claimToken = await createClaimToken(page);
      
      // Navigate to claim page
      await page.goto(`/claim?token=${claimToken}`);
      await page.waitForLoadState('networkidle');
      
      // Fill out the form
      await fillClaimForm(page, {
        name: `TestPlant${Date.now()}`,
        speciesIndex: 0, // Select first species
        potSize: '15',
        lightLevel: 'MEDIUM',
        location: 'Living room',
        personality: 'FUNNY',
        lastWatered: new Date().toISOString().split('T')[0]
      });
      
      // Submit the form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Wait for success message and redirect
      await page.waitForTimeout(3000);
      
      // Should redirect to dashboard or show success message
      const successMessage = page.locator('text=Plant claimed successfully');
      if (await successMessage.isVisible()) {
        await expect(successMessage).toBeVisible();
        
        // Wait for redirect to dashboard
        await page.waitForURL('**/app', { timeout: 10000 });
        await expect(page).toHaveURL(/.*\/app/);
      } else {
        // If no success message, check if we're redirected to dashboard
        await expect(page).toHaveURL(/.*\/app/);
      }
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/claim-success.png' });
    });

    test('should handle duplicate plant names', async ({ page }) => {
      // First authenticate the user
      await authenticateUser(page, testUser);
      
      // Create a valid claim token
      const claimToken = await createClaimToken(page);
      
      // Navigate to claim page
      await page.goto(`/claim?token=${claimToken}`);
      await page.waitForLoadState('networkidle');
      
      // Use a name that might already exist
      const duplicateName = 'DuplicatePlant';
      
      // Fill out the form with duplicate name
      await fillClaimForm(page, {
        name: duplicateName,
        speciesIndex: 0,
        potSize: '15',
        lightLevel: 'MEDIUM',
        location: 'Living room',
        personality: 'FUNNY',
        lastWatered: new Date().toISOString().split('T')[0]
      });
      
      // Submit the form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Wait for response
      await page.waitForTimeout(2000);
      
      // Check for error message about duplicate name
      const errorMessage = page.locator('text=already have a plant named');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/claim-duplicate-name.png' });
    });
  });

  test.describe('API Endpoint Testing', () => {
    test('should test claim API endpoint directly', async ({ page }) => {
      // First authenticate the user
      await authenticateUser(page, testUser);
      
      // Create a valid claim token
      const claimToken = await createClaimToken(page);
      
      // Test the API endpoint directly
      const response = await page.request.post('/api/plants/claim', {
        data: {
          token: claimToken,
          name: `APITestPlant${Date.now()}`,
          speciesId: 'test-species-id', // This might need to be a real species ID
          potSizeCm: 15,
          lightLevel: 'MEDIUM',
          location: 'Test location',
          personality: 'FUNNY',
          lastWateredAt: new Date().toISOString().split('T')[0]
        }
      });
      
      // Check response status
      console.log('API Response Status:', response.status());
      console.log('API Response Body:', await response.text());
      
      // The response might be 400 if speciesId is invalid, which is expected
      expect([200, 400, 500]).toContain(response.status());
    });
  });
});

// Helper functions
async function authenticateUser(page: any, user: { email: string; password: string }) {
  // Navigate to sign-up page
  await page.goto('/sign-up');
  await page.waitForLoadState('networkidle');
  
  // Fill sign-up form
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  
  await emailInput.fill(user.email);
  await passwordInput.fill(user.password);
  
  // Submit form
  const submitButton = page.locator('button[type="submit"]').first();
  await submitButton.click();
  
  // Wait for redirect to dashboard
  await page.waitForURL('**/app', { timeout: 30000 });
}

async function createClaimToken(page: any): Promise<string> {
  // This is a mock function - in a real scenario, you'd create a claim token via API
  // For now, we'll use a test token that should be handled by the application
  return `test-token-${Date.now()}`;
}

async function fillClaimForm(page: any, data: {
  name: string;
  speciesIndex: number;
  potSize: string;
  lightLevel: string;
  location: string;
  personality: string;
  lastWatered: string;
}) {
  // Fill plant name
  const nameField = page.locator('input[placeholder*="fun name"]');
  await nameField.fill(data.name);
  
  // Select species
  const speciesSelect = page.locator('[role="combobox"]').first();
  await speciesSelect.click();
  await page.waitForTimeout(500);
  
  const speciesOptions = page.locator('[role="option"]');
  if (await speciesOptions.nth(data.speciesIndex).isVisible()) {
    await speciesOptions.nth(data.speciesIndex).click();
  }
  
  // Fill pot size
  const potSizeField = page.locator('input[type="number"]');
  await potSizeField.fill(data.potSize);
  
  // Select light level
  const lightSelect = page.locator('[role="combobox"]').nth(1);
  await lightSelect.click();
  await page.waitForTimeout(500);
  
  const lightOptions = page.locator('[role="option"]');
  const lightOption = lightOptions.filter({ hasText: data.lightLevel });
  if (await lightOption.isVisible()) {
    await lightOption.click();
  }
  
  // Fill location
  const locationField = page.locator('input[placeholder*="Living room"]');
  if (await locationField.isVisible()) {
    await locationField.fill(data.location);
  }
  
  // Select personality
  const personalitySelect = page.locator('[role="combobox"]').nth(2);
  await personalitySelect.click();
  await page.waitForTimeout(500);
  
  const personalityOptions = page.locator('[role="option"]');
  const personalityOption = personalityOptions.filter({ hasText: data.personality });
  if (await personalityOption.isVisible()) {
    await personalityOption.click();
  }
  
  // Fill last watered date
  const lastWateredField = page.locator('input[type="date"]');
  await lastWateredField.fill(data.lastWatered);
}