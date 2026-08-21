const puppeteer = require('puppeteer-core');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\kosiu\\.gemini\\antigravity\\brain\\2bb98b17-83c1-4359-8f54-568a2550b76d';

async function runTabsTest() {
  console.log('🚀 Launching Headless Edge Browser for Tab-by-Tab Admin Audit...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    await page.goto('http://localhost:3000/nike/admin', { waitUntil: 'networkidle2' });

    // Fill login
    const inputs = await page.$$('input');
    await inputs[0].type('owner@nike.com');
    await inputs[1].type('admin123');
    const buttons = await page.$$('button');
    await buttons[buttons.length - 1].click();

    await new Promise(r => setTimeout(r, 2500));

    // Audit Tab 1: Products Catalog
    console.log('🔍 Testing Products Tab...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('aside button, nav button')).find(b => b.innerText.includes('Products'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'admin_products_tab.png'), fullPage: true });

    const productsCount = await page.evaluate(() => {
      return document.querySelectorAll('table tbody tr, [class*="product-row"]').length;
    });
    console.log(`✅ Products Tab Rendered: ${productsCount} rows visible.`);

    // Audit Tab 2: Categories Tab
    console.log('🔍 Testing Categories Tab...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('aside button, nav button')).find(b => b.innerText.includes('Categories'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'admin_categories_tab.png'), fullPage: true });

    const categoriesCount = await page.evaluate(() => {
      return document.querySelectorAll('.clay-card, [class*="category-card"]').length;
    });
    console.log(`✅ Categories Tab Rendered: ${categoriesCount} category cards visible.`);

    // Audit Tab 3: Orders Tab
    console.log('🔍 Testing Orders Tab...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('aside button, nav button')).find(b => b.innerText.includes('Orders'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'admin_orders_tab.png'), fullPage: true });

    const ordersCount = await page.evaluate(() => {
      return document.querySelectorAll('table tbody tr').length;
    });
    console.log(`✅ Orders Tab Rendered: ${ordersCount} order rows visible.`);

    // Audit Tab 4: Storefront Customizer
    console.log('🔍 Testing Storefront Customizer Tab...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('aside button, nav button')).find(b => b.innerText.includes('Customizer'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'admin_customizer_tab.png'), fullPage: true });

    const customizerPresent = await page.evaluate(() => {
      return document.body.innerText.includes('Hero Banner & Promotional Showcase');
    });
    console.log(`✅ Storefront Customizer Present: ${customizerPresent}`);

  } catch (err) {
    console.error('❌ Tab audit failed:', err);
  } finally {
    await browser.close();
    console.log('🏁 Tab-by-tab audit completed.');
  }
}

runTabsTest();
