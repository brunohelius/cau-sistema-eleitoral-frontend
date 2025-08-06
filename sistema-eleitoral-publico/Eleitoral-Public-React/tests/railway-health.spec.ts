import { test, expect } from '@playwright/test';

test.describe('Railway Health Check', () => {
  test('Backend API Health Check', async ({ page }) => {
    try {
      const response = await page.goto('https://eleitoral-backend-api.up.railway.app/health');
      console.log(`Backend API Status: ${response?.status()}`);
      
      if (response?.status() === 200) {
        console.log('✅ Backend API está online');
      } else {
        console.log(`❌ Backend API retornou status: ${response?.status()}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao conectar com Backend API: ${error}`);
    }
  });

  test('Admin Frontend Health Check', async ({ page }) => {
    try {
      const response = await page.goto('https://eleitoral-admin.up.railway.app');
      console.log(`Admin Frontend Status: ${response?.status()}`);
      
      if (response?.status() === 200) {
        console.log('✅ Admin Frontend está online');
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        const title = await page.title();
        console.log(`Título da página: ${title}`);
      } else {
        console.log(`❌ Admin Frontend retornou status: ${response?.status()}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao conectar com Admin Frontend: ${error}`);
    }
  });

  test('Public Frontend Health Check', async ({ page }) => {
    try {
      const response = await page.goto('https://eleitoral-public.up.railway.app');
      console.log(`Public Frontend Status: ${response?.status()}`);
      
      if (response?.status() === 200) {
        console.log('✅ Public Frontend está online');
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        const title = await page.title();
        console.log(`Título da página: ${title}`);
      } else {
        console.log(`❌ Public Frontend retornou status: ${response?.status()}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao conectar com Public Frontend: ${error}`);
    }
  });
});