import { test, expect } from '@playwright/test';

test.describe('Debug Page Structure', () => {
  test('should show what elements exist on chapa detail page', async ({ page }) => {
    await page.goto('/chapas/1');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Take screenshot to see what's actually rendered
    await page.screenshot({ path: 'chapa-detail-debug.png' });
    
    // Log all text content to understand what's on the page
    const bodyText = await page.locator('body').textContent();
    console.log('Page text content:', bodyText);
    
    // Check if React app loaded at all
    const reactRoot = page.locator('#root');
    await expect(reactRoot).toBeVisible();
    
    // Check what's actually in the root
    const rootContent = await reactRoot.innerHTML();
    console.log('Root HTML content:', rootContent.substring(0, 500));
    
    // Look for any error messages
    const errorMessages = page.locator('text=Error').or(page.locator('text=erro')).or(page.locator('text=Cannot'));
    const errorCount = await errorMessages.count();
    console.log('Error count:', errorCount);
    
    if (errorCount > 0) {
      const firstError = await errorMessages.first().textContent();
      console.log('First error:', firstError);
    }
    
    // Check browser console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    // Check if any Material-UI components loaded
    const muiComponents = page.locator('.MuiContainer-root, .MuiCard-root, .MuiButton-root');
    const muiCount = await muiComponents.count();
    console.log('MUI components found:', muiCount);
    
    // Look for specific text that should be on the page
    const chapaName = page.locator('text=Renovação CAU');
    const isVisible = await chapaName.isVisible();
    console.log('Chapa name visible:', isVisible);
    
    // Check if we can find any buttons at all
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log('Total buttons found:', buttonCount);
    
    if (buttonCount > 0) {
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const buttonText = await allButtons.nth(i).textContent();
        console.log(`Button ${i + 1}: "${buttonText}"`);
      }
    }
  });

  test('should check results detail page structure', async ({ page }) => {
    await page.goto('/resultados/1');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ path: 'results-detail-debug.png' });
    
    // Log what's on the page
    const titleElement = page.locator('text=Eleições CAU Nacional 2024');
    const isTitleVisible = await titleElement.isVisible();
    console.log('Results title visible:', isTitleVisible);
    
    // Check for any buttons
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log('Results page buttons found:', buttonCount);
    
    // Check for tabs specifically
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    console.log('Tabs found:', tabCount);
  });
});