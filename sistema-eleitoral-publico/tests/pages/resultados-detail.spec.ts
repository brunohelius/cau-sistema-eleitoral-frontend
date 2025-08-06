import { test, expect } from '@playwright/test';

test.describe('ResultadosDetailPage', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the enhanced results detail page
    await page.goto('/resultados/1');
  });

  test('should display election header with title and basic info', async ({ page }) => {
    // Check election title
    await expect(page.locator('text=Eleições CAU Nacional 2024')).toBeVisible();
    
    // Check status chip
    await expect(page.locator('text=Finalizada')).toBeVisible();
    
    // Check election type
    await expect(page.locator('text=Nacional')).toBeVisible();
    
    // Check dates
    await expect(page.locator('text=01/06/2024')).toBeVisible();
    await expect(page.locator('text=07/06/2024')).toBeVisible();
  });

  test('should display action buttons', async ({ page }) => {
    // Check action buttons
    await expect(page.locator('button[title="Imprimir"]')).toBeVisible();
    await expect(page.locator('button[title="Compartilhar"]')).toBeVisible();
    await expect(page.locator('button:has-text("Relatório PDF")')).toBeVisible();
  });

  test('should display winner announcement', async ({ page }) => {
    // Check winner announcement alert
    await expect(page.locator('text=CHAPA VENCEDORA: Renovação CAU')).toBeVisible();
    await expect(page.locator('text=4.521 votos').or(page.locator('text=4,521 votos'))).toBeVisible();
    await expect(page.locator('text=45.9% dos votos válidos')).toBeVisible();
  });

  test('should display key statistics cards', async ({ page }) => {
    // Check statistics cards
    await expect(page.locator('text=Eleitores Habilitados')).toBeVisible();
    await expect(page.locator('text=12.450').or(page.locator('text=12,450'))).toBeVisible();
    
    await expect(page.locator('text=Compareceram')).toBeVisible();
    await expect(page.locator('text=10.287').or(page.locator('text=10,287'))).toBeVisible();
    
    await expect(page.locator('text=Participação')).toBeVisible();
    await expect(page.locator('text=82.6%')).toBeVisible();
    
    await expect(page.locator('text=Chapas Participantes')).toBeVisible();
    await expect(page.locator('text=3').first()).toBeVisible();
  });

  test('should display and navigate between tabs', async ({ page }) => {
    // Check if all tabs are present
    await expect(page.locator('button[role="tab"]:has-text("Resultados por Chapa")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Gráficos e Análises")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Análise Regional")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Timeline da Eleição")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Informações Técnicas")')).toBeVisible();

    // Test tab navigation
    await page.locator('button[role="tab"]:has-text("Gráficos e Análises")').click();
    await expect(page.locator('text=Votos por Chapa')).toBeVisible();
    await expect(page.locator('text=Distribuição de Votos')).toBeVisible();
    
    await page.locator('button[role="tab"]:has-text("Análise Regional")').click();
    await expect(page.locator('text=Participação por Região')).toBeVisible();
  });

  test('should display chapa results in first tab', async ({ page }) => {
    // Should be on "Resultados por Chapa" tab by default
    await expect(page.locator('text=Renovação CAU')).toBeVisible();
    await expect(page.locator('text=Progresso Profissional')).toBeVisible();
    await expect(page.locator('text=União dos Arquitetos')).toBeVisible();
    
    // Check vote counts and percentages
    await expect(page.locator('text=4.521').or(page.locator('text=4,521'))).toBeVisible();
    await expect(page.locator('text=45.9%')).toBeVisible();
    
    // Check winner highlighting
    await expect(page.locator('text=Eleita')).toBeVisible();
    await expect(page.locator('text=Não Eleita')).toBeVisible();
    
    // Check progress bars
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
  });

  test('should open chapa details dialog when clicking "Ver Detalhes"', async ({ page }) => {
    // Click on "Ver Detalhes" button for first chapa
    await page.locator('button:has-text("Ver Detalhes")').first().click();
    
    // Check if dialog opened
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Renovação CAU')).toBeVisible();
    await expect(page.locator('text=Membros da Chapa')).toBeVisible();
    
    // Check member information
    await expect(page.locator('text=Dr. Roberto Silva')).toBeVisible();
    await expect(page.locator('text=Presidente')).toBeVisible();
    
    // Close dialog
    await page.locator('button:has-text("Fechar")').click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should display charts in graphics tab', async ({ page }) => {
    // Navigate to graphics tab
    await page.locator('button[role="tab"]:has-text("Gráficos e Análises")').click();
    
    // Check chart titles
    await expect(page.locator('text=Votos por Chapa')).toBeVisible();
    await expect(page.locator('text=Distribuição de Votos')).toBeVisible();
    await expect(page.locator('text=Estatísticas de Votação')).toBeVisible();
    await expect(page.locator('text=Padrão de Votação por Hora')).toBeVisible();
    
    // Charts should be rendered (check for SVG elements)
    await expect(page.locator('svg').first()).toBeVisible();
  });

  test('should display regional analysis', async ({ page }) => {
    // Navigate to regional analysis tab
    await page.locator('button[role="tab"]:has-text("Análise Regional")').click();
    
    // Check regional cards
    await expect(page.locator('text=Norte')).toBeVisible();
    await expect(page.locator('text=Nordeste')).toBeVisible();
    await expect(page.locator('text=Centro-Oeste')).toBeVisible();
    await expect(page.locator('text=Sudeste')).toBeVisible();
    await expect(page.locator('text=Sul')).toBeVisible();
    
    // Check participation percentages
    await expect(page.locator('text=78.5%')).toBeVisible();
    await expect(page.locator('text=85.2%')).toBeVisible();
    
    // Check progress bars for regional data
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
  });

  test('should display timeline events', async ({ page }) => {
    // Navigate to timeline tab
    await page.locator('button[role="tab"]:has-text("Timeline da Eleição")').click();
    
    // Check timeline events
    await expect(page.locator('text=Abertura das Inscrições')).toBeVisible();
    await expect(page.locator('text=Prazo Final para Registro de Chapas')).toBeVisible();
    await expect(page.locator('text=Início do Período de Campanha')).toBeVisible();
    await expect(page.locator('text=Início da Votação Eletrônica')).toBeVisible();
    await expect(page.locator('text=Encerramento da Votação')).toBeVisible();
    await expect(page.locator('text=Divulgação dos Resultados')).toBeVisible();
    
    // Check dates
    await expect(page.locator('text=01/05/2024')).toBeVisible();
    await expect(page.locator('text=08/06/2024')).toBeVisible();
  });

  test('should display technical information', async ({ page }) => {
    // Navigate to technical information tab
    await page.locator('button[role="tab"]:has-text("Informações Técnicas")').click();
    
    // Check technical info section
    await expect(page.locator('text=Informações Técnicas')).toBeVisible();
    await expect(page.locator('text=Sistema de Votação')).toBeVisible();
    await expect(page.locator('text=Eletrônico com certificação digital')).toBeVisible();
    await expect(page.locator('text=Período de Votação')).toBeVisible();
    await expect(page.locator('text=Modalidade')).toBeVisible();
    await expect(page.locator('text=Votação 100% eletrônica')).toBeVisible();
    
    // Check validation section
    await expect(page.locator('text=Validação e Auditoria')).toBeVisible();
    await expect(page.locator('text=Integridade dos Dados')).toBeVisible();
    await expect(page.locator('text=Verificada por hash criptográfico')).toBeVisible();
    await expect(page.locator('text=Auditoria Externa')).toBeVisible();
    await expect(page.locator('text=Logs de Sistema')).toBeVisible();
    await expect(page.locator('text=Certificação Digital')).toBeVisible();
    await expect(page.locator('text=ICP-Brasil A3')).toBeVisible();
    
    // Check checkmark icons
    await expect(page.locator('[data-testid="CheckCircleIcon"]').or(page.locator('svg[data-testid="CheckCircleIcon"]'))).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if essential elements are still visible
    await expect(page.locator('text=Eleições CAU Nacional 2024')).toBeVisible();
    await expect(page.locator('text=CHAPA VENCEDORA: Renovação CAU')).toBeVisible();
    
    // Check if tabs are still functional on mobile
    await page.locator('button[role="tab"]:has-text("Gráficos e Análises")').click();
    await expect(page.locator('text=Votos por Chapa')).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    // Check back button
    await expect(page.locator('text=← Voltar aos Resultados')).toBeVisible();
    
    // Test back navigation
    await page.locator('text=← Voltar aos Resultados').click();
    await expect(page).toHaveURL(/.*resultados$/);
  });

  test('should handle print functionality', async ({ page }) => {
    // Test print button (should not throw errors)
    const printButton = page.locator('button[title="Imprimir"]');
    await expect(printButton).toBeVisible();
    
    // Note: We can't easily test the actual print dialog without mocking
    // but we can ensure the button is clickable
    await expect(printButton).toBeEnabled();
  });
});