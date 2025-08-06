import { test, expect } from '@playwright/test';

test.describe('App Navigation', () => {
  test('should navigate through main electoral pages', async ({ page }) => {
    // Start at home page
    await page.goto('/');
    
    // Navigate to chapas
    await page.goto('/chapas');
    await expect(page).toHaveURL(/.*chapas$/);
    
    // Navigate to specific chapa
    await page.goto('/chapas/1');
    await expect(page).toHaveURL(/.*chapas\/1$/);
    await expect(page.locator('text=Renovação CAU')).toBeVisible();
    
    // Navigate to results
    await page.goto('/resultados');
    await expect(page).toHaveURL(/.*resultados$/);
    await expect(page.locator('text=Resultados Eleitorais')).toBeVisible();
    
    // Navigate to specific result
    await page.goto('/resultados/1');
    await expect(page).toHaveURL(/.*resultados\/1$/);
    await expect(page.locator('text=Eleições CAU Nacional 2024')).toBeVisible();
  });

  test('should handle back navigation correctly', async ({ page }) => {
    // Go to chapa detail
    await page.goto('/chapas/1');
    await expect(page.locator('text=Renovação CAU')).toBeVisible();
    
    // Use back button
    await page.locator('button:has-text("Voltar às Chapas")').click();
    await expect(page).toHaveURL(/.*chapas$/);
    
    // Go to results detail
    await page.goto('/resultados/1');
    await expect(page.locator('text=Eleições CAU Nacional 2024')).toBeVisible();
    
    // Use back button
    await page.locator('text=← Voltar aos Resultados').click();
    await expect(page).toHaveURL(/.*resultados$/);
  });

  test('should handle invalid routes gracefully', async ({ page }) => {
    // Try invalid chapa ID
    await page.goto('/chapas/999');
    // Should still load the page structure (uses mock data)
    await expect(page.locator('text=Renovação CAU')).toBeVisible();
    
    // Try invalid result ID
    await page.goto('/resultados/999');
    // Should still load the page structure (uses mock data)
    await expect(page.locator('text=Eleições CAU Nacional 2024')).toBeVisible();
  });

  test('should maintain navigation state across page refreshes', async ({ page }) => {
    // Navigate to a specific page
    await page.goto('/chapas/1');
    await expect(page.locator('text=Renovação CAU')).toBeVisible();
    
    // Refresh the page
    await page.reload();
    
    // Should still be on the same page
    await expect(page).toHaveURL(/.*chapas\/1$/);
    await expect(page.locator('text=Renovação CAU')).toBeVisible();
  });

  test('should handle browser back/forward buttons', async ({ page }) => {
    // Navigate through several pages
    await page.goto('/');
    await page.goto('/chapas');
    await page.goto('/chapas/1');
    await page.goto('/resultados');
    
    // Use browser back button
    await page.goBack();
    await expect(page).toHaveURL(/.*chapas\/1$/);
    
    await page.goBack();
    await expect(page).toHaveURL(/.*chapas$/);
    
    // Use browser forward button
    await page.goForward();
    await expect(page).toHaveURL(/.*chapas\/1$/);
  });

  test('should handle deep linking to specific pages', async ({ page }) => {
    // Direct navigation to chapa detail
    await page.goto('/chapas/1');
    await expect(page.locator('text=Renovação CAU')).toBeVisible();
    await expect(page.locator('text=Construindo o Futuro da Arquitetura')).toBeVisible();
    
    // Direct navigation to results detail
    await page.goto('/resultados/1');
    await expect(page.locator('text=Eleições CAU Nacional 2024')).toBeVisible();
    await expect(page.locator('text=CHAPA VENCEDORA: Renovação CAU')).toBeVisible();
  });

  test('should preserve tab state within pages during navigation', async ({ page }) => {
    // Go to chapa detail and switch to proposals tab
    await page.goto('/chapas/1');
    await page.locator('button[role="tab"]:has-text("Propostas")').click();
    await expect(page.locator('text=Programa de Gestão')).toBeVisible();
    
    // Navigate away and back
    await page.goto('/resultados');
    await page.goto('/chapas/1');
    
    // Should be back on default tab (members)
    await expect(page.locator('text=Membros da Chapa')).toBeVisible();
  });

  test('should handle URL parameters correctly', async ({ page }) => {
    // Test with different chapa IDs
    await page.goto('/chapas/1');
    await expect(page.locator('text=Renovação CAU')).toBeVisible();
    
    await page.goto('/chapas/2');
    // Should load the same structure (using mock data)
    await expect(page.locator('text=Renovação CAU')).toBeVisible();
    
    // Test with different result IDs
    await page.goto('/resultados/1');
    await expect(page.locator('text=Eleições CAU Nacional 2024')).toBeVisible();
    
    await page.goto('/resultados/2');
    // Should load the same structure (using mock data)
    await expect(page.locator('text=Eleições CAU Nacional 2024')).toBeVisible();
  });
});