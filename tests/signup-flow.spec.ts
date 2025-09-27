import { test, expect } from '@playwright/test';

test.describe('Sign-up Flow', () => {
  test('should complete sign-up and access dashboard', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the homepage
    await page.screenshot({ path: 'test-results/01-homepage.png' });
    
    // Look for sign-in or sign-up button
    const signInButton = page.locator('text=Sign in').first();
    await expect(signInButton).toBeVisible();
    
    // Click sign-in button
    await signInButton.click();
    
    // Wait for redirect to sign-in page
    await page.waitForURL('**/sign-in**');
    await page.screenshot({ path: 'test-results/02-signin-page.png' });
    
    // Look for sign-up link
    const signUpLink = page.locator('text=Sign up').first();
    await expect(signUpLink).toBeVisible();
    
    // Click sign-up link
    await signUpLink.click();
    
    // Wait for redirect to sign-up page
    await page.waitForURL('**/sign-up**');
    await page.screenshot({ path: 'test-results/03-signup-page.png' });
    
    // Fill in sign-up form
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    // Use a unique email for testing
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    await emailInput.fill(testEmail);
    await passwordInput.fill(testPassword);
    
    // Take screenshot before submitting
    await page.screenshot({ path: 'test-results/04-form-filled.png' });
    
    // Submit the form
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/app**', { timeout: 30000 });
    await page.screenshot({ path: 'test-results/05-dashboard.png' });
    
    // Check if we're on the dashboard
    await expect(page).toHaveURL(/.*\/app/);
    
    // Check for dashboard content
    const dashboardTitle = page.locator('h1').first();
    await expect(dashboardTitle).toBeVisible();
    
    // Check that we don't see "Database Setup Required" message
    const dbSetupMessage = page.locator('text=Database Setup Required');
    await expect(dbSetupMessage).not.toBeVisible();
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/06-final-dashboard.png' });
    
    console.log('✅ Sign-up flow completed successfully!');
    console.log(`📧 Test email used: ${testEmail}`);
  });
});
