import { test, expect } from '@playwright/test';

test.describe('ResultadosPage', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the results page
    await page.goto('/resultados');
  });

  test('should display page header and description', async ({ page }) => {
    // Check page title
    await expect(page.locator('text=Resultados Eleitorais')).toBeVisible();
    
    // Check page description
    await expect(page.locator('text=Consulte os resultados oficiais das eleições finalizadas do CAU')).toBeVisible();
  });

  test('should display general statistics cards', async ({ page }) => {
    // Check statistics cards
    await expect(page.locator('text=Eleições Finalizadas')).toBeVisible();
    await expect(page.locator('text=Profissionais Habilitados')).toBeVisible();
    await expect(page.locator('text=Total de Votos')).toBeVisible();
    await expect(page.locator('text=Participação Média')).toBeVisible();
    
    // Check if numbers are displayed
    await expect(page.locator('text=8.750').or(page.locator('text=8,750'))).toBeVisible();
    await expect(page.locator('text=15.420').or(page.locator('text=15,420'))).toBeVisible();
    await expect(page.locator('text=87.5%')).toBeVisible();
  });

  test('should display and use search filters', async ({ page }) => {
    // Check filter section
    await expect(page.locator('input[placeholder="Título da eleição..."]')).toBeVisible();
    await expect(page.locator('text=UF')).toBeVisible();
    await expect(page.locator('text=Ano')).toBeVisible();
    
    // Test search functionality
    await page.fill('input[placeholder="Título da eleição..."]', 'CAU');
    await expect(page.locator('input[placeholder="Título da eleição..."]')).toHaveValue('CAU');
    
    // Test UF filter
    await page.locator('text=UF').click();
    await page.locator('text=Nacional').click();
    
    // Check results counter
    await expect(page.locator('text=resultados encontrados')).toBeVisible();
  });

  test('should display and navigate between tabs', async ({ page }) => {
    // Check if tabs are present
    await expect(page.locator('button[role="tab"]').filter({ hasText: /Nacionais/ })).toBeVisible();
    await expect(page.locator('button[role="tab"]').filter({ hasText: /Regionais/ })).toBeVisible();
    await expect(page.locator('button[role="tab"]').filter({ hasText: /Todas/ })).toBeVisible();

    // Test tab navigation
    await page.locator('button[role="tab"]').filter({ hasText: /Regionais/ }).click();
    await page.locator('button[role="tab"]').filter({ hasText: /Todas/ }).click();
    await page.locator('button[role="tab"]').filter({ hasText: /Nacionais/ }).click();
  });

  test('should display election cards with mock data', async ({ page }) => {
    // Wait for elections to load (they should appear as cards)
    // Note: This tests the UI structure even with mock data
    
    // Check if election cards have proper structure
    const electionCards = page.locator('[role="button"]').or(page.locator('.MuiCard-root'));
    
    // Should have some election cards or placeholder
    await expect(
      electionCards.first().or(page.locator('text=Nenhum resultado encontrado'))
    ).toBeVisible();
    
    // If cards exist, they should have proper elements
    if (await electionCards.count() > 0) {
      const firstCard = electionCards.first();
      
      // Cards should have status chip
      await expect(firstCard.locator('text=Finalizada').or(page.locator('.MuiChip-root'))).toBeVisible();
      
      // Cards should have view button
      await expect(firstCard.locator('text=Ver Resultado Completo')).toBeVisible();
    }
  });

  test('should handle empty state gracefully', async ({ page }) => {
    // If no results, should show appropriate message
    const noResultsMessage = page.locator('text=Nenhum resultado encontrado');
    const hasResults = await page.locator('.MuiCard-root').count() > 0;
    
    if (!hasResults) {
      await expect(noResultsMessage).toBeVisible();
      await expect(page.locator('text=Tente ajustar os filtros de busca')).toBeVisible();
    }
  });

  test('should display transparency section', async ({ page }) => {
    // Scroll to transparency section
    await page.locator('text=Transparência Eleitoral').scrollIntoViewIfNeeded();
    
    // Check transparency section
    await expect(page.locator('text=Transparência Eleitoral')).toBeVisible();
    await expect(page.locator('text=Dados Abertos')).toBeVisible();
    await expect(page.locator('text=Metodologia')).toBeVisible();
    
    // Check transparency content
    await expect(page.locator('text=Todos os resultados eleitorais são públicos')).toBeVisible();
    await expect(page.locator('text=As eleições seguem metodologia estabelecida')).toBeVisible();
    
    // Check action buttons
    await expect(page.locator('button:has-text("Baixar Dados (CSV)")')).toBeVisible();
    await expect(page.locator('button:has-text("Ver Regulamento")')).toBeVisible();
  });

  test('should navigate to detailed results when clicking cards', async ({ page }) => {
    // Check if there are any election cards to click
    const electionCards = page.locator('[role="button"]').or(page.locator('.MuiCard-root[role="button"]'));
    const cardCount = await electionCards.count();
    
    if (cardCount > 0) {
      // Click the first election card
      await electionCards.first().click();
      
      // Should navigate to results detail page
      await expect(page).toHaveURL(/.*resultados\/\d+/);
    }
  });

  test('should have working action buttons on cards', async ({ page }) => {
    const viewButtons = page.locator('button:has-text("Ver Resultado Completo")');
    const downloadButtons = page.locator('button:has-text("Baixar Relatório")');
    
    const viewButtonCount = await viewButtons.count();
    
    if (viewButtonCount > 0) {
      // View buttons should be enabled
      await expect(viewButtons.first()).toBeEnabled();
      
      // Download buttons should be disabled (placeholder)
      if (await downloadButtons.count() > 0) {
        await expect(downloadButtons.first()).toBeDisabled();
      }
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if essential elements are still visible
    await expect(page.locator('text=Resultados Eleitorais')).toBeVisible();
    
    // Statistics cards should stack vertically on mobile
    const statsCards = page.locator('text=Eleições Finalizadas').locator('..');
    await expect(statsCards).toBeVisible();
    
    // Filters should still be accessible
    await expect(page.locator('input[placeholder="Título da eleição..."]')).toBeVisible();
    
    // Tabs should still work
    await expect(page.locator('button[role="tab"]').first()).toBeVisible();
  });

  test('should handle filter interactions correctly', async ({ page }) => {
    // Test search input
    const searchInput = page.locator('input[placeholder="Título da eleição..."]');
    await searchInput.fill('Nacional');
    await expect(searchInput).toHaveValue('Nacional');
    
    // Test year filter
    const yearSelect = page.locator('text=Ano').locator('..');
    if (await yearSelect.count() > 0) {
      await yearSelect.click();
      // Should see dropdown options (if any data exists)
      await expect(page.locator('text=Todos')).toBeVisible();
    }
    
    // Results counter should update
    await expect(page.locator('text=resultados encontrados')).toBeVisible();
  });

  test('should maintain filter state during tab navigation', async ({ page }) => {
    // Set a filter
    await page.fill('input[placeholder="Título da eleição..."]', 'CAU');
    
    // Switch tabs
    await page.locator('button[role="tab"]').filter({ hasText: /Regionais/ }).click();
    await page.locator('button[role="tab"]').filter({ hasText: /Nacionais/ }).click();
    
    // Filter should still be applied
    await expect(page.locator('input[placeholder="Título da eleição..."]')).toHaveValue('CAU');
  });
});