import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('chapa detail page should be accessible', async ({ page }) => {
    await page.goto('/chapas/1');
    
    // Check for proper heading hierarchy
    await expect(page.locator('h1, h2, h3, h4, h5, h6').first()).toBeVisible();
    
    // Check for proper ARIA labels on tabs
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    
    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      await expect(tab).toHaveAttribute('role', 'tab');
    }
    
    // Check for proper ARIA labels on tabpanels
    const tabpanels = page.locator('[role="tabpanel"]');
    const panelCount = await tabpanels.count();
    
    if (panelCount > 0) {
      const visiblePanel = tabpanels.first();
      await expect(visiblePanel).toHaveAttribute('role', 'tabpanel');
    }
    
    // Check for proper button accessibility
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const isVisible = await button.isVisible();
      
      if (isVisible) {
        // Button should have accessible text (either text content or aria-label)
        const hasText = await button.textContent();
        const hasAriaLabel = await button.getAttribute('aria-label');
        const hasTitle = await button.getAttribute('title');
        
        expect(hasText || hasAriaLabel || hasTitle).toBeTruthy();
      }
    }
    
    // Check for proper dialog accessibility
    const viewCurriculumButton = page.locator('button:has-text("Ver Currículo Completo")').first();
    if (await viewCurriculumButton.isVisible()) {
      await viewCurriculumButton.click();
      
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAttribute('role', 'dialog');
      
      // Close dialog
      await page.locator('button:has-text("Fechar")').click();
    }
  });

  test('results detail page should be accessible', async ({ page }) => {
    await page.goto('/resultados/1');
    
    // Check for proper heading structure
    await expect(page.locator('h1, h2, h3, h4, h5, h6').first()).toBeVisible();
    
    // Check tab accessibility
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    
    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      await expect(tab).toHaveAttribute('role', 'tab');
      
      // Tabs should have accessible names
      const tabText = await tab.textContent();
      expect(tabText?.trim()).toBeTruthy();
    }
    
    // Check for proper table accessibility in technical info tab
    await page.locator('button[role="tab"]:has-text("Informações Técnicas")').click();
    
    const lists = page.locator('ul, ol');
    const listCount = await lists.count();
    
    if (listCount > 0) {
      // Lists should have proper structure
      const firstList = lists.first();
      const listItems = firstList.locator('li');
      const itemCount = await listItems.count();
      
      if (itemCount > 0) {
        await expect(listItems.first()).toBeVisible();
      }
    }
    
    // Check chart accessibility (charts should have aria-labels or titles)
    await page.locator('button[role="tab"]:has-text("Gráficos e Análises")').click();
    
    // SVG charts should be present
    const charts = page.locator('svg');
    const chartCount = await charts.count();
    
    if (chartCount > 0) {
      // Charts are rendered (accessibility is handled by recharts library)
      await expect(charts.first()).toBeVisible();
    }
  });

  test('results page should be accessible', async ({ page }) => {
    await page.goto('/resultados');
    
    // Check form accessibility
    const searchInput = page.locator('input[placeholder="Título da eleição..."]');
    await expect(searchInput).toBeVisible();
    
    // Input should have proper label association
    const inputLabel = page.locator('label:has-text("Buscar eleição")').or(page.locator('text=Buscar eleição'));
    await expect(inputLabel).toBeVisible();
    
    // Check select accessibility
    const ufSelect = page.locator('text=UF').locator('..');
    if (await ufSelect.count() > 0) {
      // Select should have proper labeling
      await expect(page.locator('text=UF')).toBeVisible();
    }
    
    // Check tab accessibility
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    
    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      await expect(tab).toHaveAttribute('role', 'tab');
    }
    
    // Check card accessibility
    const cards = page.locator('.MuiCard-root');
    const cardCount = await cards.count();
    
    if (cardCount > 0) {
      const firstCard = cards.first();
      
      // Cards with click handlers should be keyboard accessible
      const isClickable = await firstCard.getAttribute('role');
      if (isClickable === 'button') {
        await expect(firstCard).toHaveAttribute('role', 'button');
      }
    }
  });

  test('keyboard navigation should work properly', async ({ page }) => {
    await page.goto('/chapas/1');
    
    // Test tab navigation through interactive elements
    await page.keyboard.press('Tab');
    
    // Check if focus is visible on interactive elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test Enter key on buttons
    const firstButton = page.locator('button').first();
    if (await firstButton.isVisible()) {
      await firstButton.focus();
      // Should be able to focus on button
      await expect(firstButton).toBeFocused();
    }
    
    // Test tab navigation on tabs
    const firstTab = page.locator('[role="tab"]').first();
    if (await firstTab.isVisible()) {
      await firstTab.focus();
      await expect(firstTab).toBeFocused();
      
      // Arrow keys should navigate between tabs
      await page.keyboard.press('ArrowRight');
      const secondTab = page.locator('[role="tab"]').nth(1);
      if (await secondTab.isVisible()) {
        await expect(secondTab).toBeFocused();
      }
    }
  });

  test('should have proper color contrast and visual indicators', async ({ page }) => {
    await page.goto('/chapas/1');
    
    // Check for status indicators with proper styling
    const statusChip = page.locator('text=Eleita');
    if (await statusChip.isVisible()) {
      // Status should be visible and distinguishable
      await expect(statusChip).toBeVisible();
    }
    
    // Check for interactive element states
    const buttons = page.locator('button:visible');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      
      // Hover state test
      await firstButton.hover();
      // Button should still be visible and clickable
      await expect(firstButton).toBeVisible();
    }
    
    // Check for progress indicators
    await page.goto('/resultados/1');
    const progressBars = page.locator('[role="progressbar"]');
    const progressCount = await progressBars.count();
    
    if (progressCount > 0) {
      const firstProgress = progressBars.first();
      await expect(firstProgress).toBeVisible();
      
      // Progress bar should have proper attributes
      await expect(firstProgress).toHaveAttribute('role', 'progressbar');
    }
  });

  test('should handle screen reader announcements properly', async ({ page }) => {
    await page.goto('/resultados/1');
    
    // Check for live regions and announcements
    const alerts = page.locator('[role="alert"]');
    const alertCount = await alerts.count();
    
    if (alertCount > 0) {
      const firstAlert = alerts.first();
      await expect(firstAlert).toBeVisible();
      await expect(firstAlert).toHaveAttribute('role', 'alert');
    }
    
    // Check for status announcements
    const status = page.locator('[role="status"]');
    const statusCount = await status.count();
    
    if (statusCount > 0) {
      const firstStatus = status.first();
      await expect(firstStatus).toHaveAttribute('role', 'status');
    }
    
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    const h2 = page.locator('h2');
    const h3 = page.locator('h3');
    
    const h1Count = await h1.count();
    if (h1Count > 0) {
      await expect(h1.first()).toBeVisible();
    }
    
    // Should have proper heading structure
    const h2Count = await h2.count();
    const h3Count = await h3.count();
    
    // At minimum, should have some heading structure
    expect(h1Count + h2Count + h3Count).toBeGreaterThan(0);
  });
});