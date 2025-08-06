import { test, expect } from '@playwright/test';

test.describe('ChapaDetailPage', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the enhanced chapa detail page
    await page.goto('/chapas/1');
  });

  test('should display chapa header with banner and basic info', async ({ page }) => {
    // Check if the banner is displayed
    await expect(page.locator('[data-testid="chapa-banner"]').or(page.locator('text=Renovação CAU'))).toBeVisible();
    
    // Check chapa name
    await expect(page.locator('text=Renovação CAU')).toBeVisible();
    
    // Check chapa slogan
    await expect(page.locator('text=Construindo o Futuro da Arquitetura')).toBeVisible();
    
    // Check chapa number
    await expect(page.locator('text=1').first()).toBeVisible();
    
    // Check status chip
    await expect(page.locator('text=Eleita')).toBeVisible();
  });

  test('should display quick statistics cards', async ({ page }) => {
    // Check if statistics cards are displayed
    await expect(page.locator('text=Votos Recebidos')).toBeVisible();
    await expect(page.locator('text=Percentual')).toBeVisible();
    await expect(page.locator('text=Membros')).toBeVisible();
    await expect(page.locator('text=Posição')).toBeVisible();

    // Check if vote count is displayed
    await expect(page.locator('text=4.521').or(page.locator('text=4,521'))).toBeVisible();
    
    // Check percentage
    await expect(page.locator('text=45.9%')).toBeVisible();
  });

  test('should display action buttons', async ({ page }) => {
    // Check action buttons
    await expect(page.locator('button:has-text("Imprimir")')).toBeVisible();
    await expect(page.locator('button:has-text("Compartilhar")')).toBeVisible();
    await expect(page.locator('button:has-text("Baixar Programa")')).toBeVisible();
  });

  test('should display and navigate between tabs', async ({ page }) => {
    // Check if all tabs are present
    await expect(page.locator('button[role="tab"]:has-text("Membros")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Propostas")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Histórico")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Documentos")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Estatísticas")')).toBeVisible();

    // Test tab navigation
    await page.locator('button[role="tab"]:has-text("Propostas")').click();
    await expect(page.locator('text=Programa de Gestão')).toBeVisible();
    
    await page.locator('button[role="tab"]:has-text("Histórico")').click();
    await expect(page.locator('text=Histórico do Processo')).toBeVisible();
    
    await page.locator('button[role="tab"]:has-text("Documentos")').click();
    await expect(page.locator('text=Documentos da Chapa')).toBeVisible();
  });

  test('should display member information in members tab', async ({ page }) => {
    // Make sure we're on the members tab (default)
    await expect(page.locator('text=Membros da Chapa')).toBeVisible();
    
    // Check if member cards are displayed
    await expect(page.locator('text=Dr. Roberto Silva Santos')).toBeVisible();
    await expect(page.locator('text=Presidente')).toBeVisible();
    await expect(page.locator('text=Arq. Maria Santos Lima')).toBeVisible();
    await expect(page.locator('text=Vice-Presidente')).toBeVisible();
    
    // Check contact information
    await expect(page.locator('text=roberto@renovacaocau.org')).toBeVisible();
    await expect(page.locator('text=(11) 99999-0001')).toBeVisible();
  });

  test('should open member curriculum dialog when clicking "Ver Currículo Completo"', async ({ page }) => {
    // Click on the first "Ver Currículo Completo" button
    await page.locator('button:has-text("Ver Currículo Completo")').first().click();
    
    // Check if dialog opened
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Dr. Roberto Silva Santos')).toBeVisible();
    await expect(page.locator('text=Informações Profissionais')).toBeVisible();
    await expect(page.locator('text=Doutor em Arquitetura pela USP')).toBeVisible();
    
    // Check specializations
    await expect(page.locator('text=Arquitetura Hospitalar')).toBeVisible();
    await expect(page.locator('text=Sustentabilidade')).toBeVisible();
    
    // Close dialog
    await page.locator('button:has-text("Fechar")').click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should display proposals in accordion format', async ({ page }) => {
    // Navigate to proposals tab
    await page.locator('button[role="tab"]:has-text("Propostas")').click();
    
    // Check resume alert
    await expect(page.locator('text=Nossa chapa propõe uma renovação completa')).toBeVisible();
    
    // Check accordion sections
    await expect(page.locator('text=Transparência e Gestão')).toBeVisible();
    await expect(page.locator('text=Modernização Tecnológica')).toBeVisible();
    await expect(page.locator('text=Valorização Profissional')).toBeVisible();
    await expect(page.locator('text=Sustentabilidade e Inovação')).toBeVisible();
    
    // Test accordion expansion
    const modernizacaoAccordion = page.locator('text=Modernização Tecnológica').locator('..');
    await modernizacaoAccordion.click();
    await expect(page.locator('text=Digitalização completa dos serviços do CAU')).toBeVisible();
  });

  test('should display timeline in historical tab', async ({ page }) => {
    // Navigate to historical tab
    await page.locator('button[role="tab"]:has-text("Histórico")').click();
    
    // Check timeline events
    await expect(page.locator('text=Registro da Chapa')).toBeVisible();
    await expect(page.locator('text=Análise de Documentação')).toBeVisible();
    await expect(page.locator('text=Homologação')).toBeVisible();
    await expect(page.locator('text=Início da Campanha')).toBeVisible();
    await expect(page.locator('text=Resultado Final')).toBeVisible();
    
    // Check if dates are displayed
    await expect(page.locator('text=15/01/2024')).toBeVisible();
  });

  test('should display documents table', async ({ page }) => {
    // Navigate to documents tab
    await page.locator('button[role="tab"]:has-text("Documentos")').click();
    
    // Check table headers
    await expect(page.locator('text=Documento')).toBeVisible();
    await expect(page.locator('text=Tipo')).toBeVisible();
    await expect(page.locator('text=Tamanho')).toBeVisible();
    await expect(page.locator('text=Data')).toBeVisible();
    await expect(page.locator('text=Ações')).toBeVisible();
    
    // Check document entries
    await expect(page.locator('text=Programa de Gestão')).toBeVisible();
    await expect(page.locator('text=Declaração de Elegibilidade')).toBeVisible();
    await expect(page.locator('text=Currículo dos Candidatos')).toBeVisible();
  });

  test('should display statistics in statistics tab', async ({ page }) => {
    // Navigate to statistics tab
    await page.locator('button[role="tab"]:has-text("Estatísticas")').click();
    
    // Check statistics sections
    await expect(page.locator('text=Resultado da Eleição')).toBeVisible();
    await expect(page.locator('text=Informações da Eleição')).toBeVisible();
    
    // Check specific statistics
    await expect(page.locator('text=Eleita')).toBeVisible();
    await expect(page.locator('text=4.521 votos').or(page.locator('text=4,521 votos'))).toBeVisible();
    await expect(page.locator('text=45.9% dos votos válidos')).toBeVisible();
    await expect(page.locator('text=1º lugar de 3 chapas')).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if essential elements are still visible
    await expect(page.locator('text=Renovação CAU')).toBeVisible();
    await expect(page.locator('text=Construindo o Futuro da Arquitetura')).toBeVisible();
    
    // Check if tabs are still functional
    await page.locator('button[role="tab"]:has-text("Propostas")').click();
    await expect(page.locator('text=Programa de Gestão')).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    // Check back button
    await expect(page.locator('button:has-text("Voltar às Chapas")')).toBeVisible();
    
    // Test back navigation
    await page.locator('button:has-text("Voltar às Chapas")').click();
    await expect(page).toHaveURL(/.*chapas$/);
  });
});