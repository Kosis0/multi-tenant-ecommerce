const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\kosiu\\.gemini\\antigravity\\brain\\2bb98b17-83c1-4359-8f54-568a2550b76d';

async function runTest() {
  console.log('🚀 Launching Headless Edge Browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => consoleLogs.push(`[BROWSER ERROR] ${err.toString()}`));

  try {
    const targetUrl = 'http://localhost:3000/nike/admin';
    console.log(`📡 Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Screenshot 1: Login Page
    const loginScreenshotPath = path.join(ARTIFACT_DIR, 'admin_login_screen.png');
    await page.screenshot({ path: loginScreenshotPath, fullPage: true });
    console.log(`📸 Captured login screenshot at ${loginScreenshotPath}`);

    // Type credentials
    console.log('⌨️ Typing credentials into login form...');
    await page.waitForSelector('input', { timeout: 10000 });
    
    // Fill email
    const emailInput = (await page.$$('input'))[0];
    await emailInput.click({ clickCount: 3 });
    await emailInput.type('owner@nike.com');

    // Fill password
    const passwordInput = (await page.$$('input'))[1];
    await passwordInput.click({ clickCount: 3 });
    await passwordInput.type('admin123');

    // Click submit
    console.log('🖱️ Clicking Access Merchant Center button...');
    const buttons = await page.$$('button');
    const submitBtn = buttons[buttons.length - 1]; // Main action button
    await submitBtn.click();

    // Wait for dashboard to render
    console.log('⏳ Waiting for dashboard state transition...');
    await new Promise(r => setTimeout(r, 4000));

    // Screenshot 2: Dashboard Post-Login
    const dashboardScreenshotPath = path.join(ARTIFACT_DIR, 'admin_dashboard_screen.png');
    await page.screenshot({ path: dashboardScreenshotPath, fullPage: true });
    console.log(`📸 Captured dashboard screenshot at ${dashboardScreenshotPath}`);

    // Inspect rendered elements
    const pageContent = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText.trim());
      const cards = Array.from(document.querySelectorAll('.clay-card, [class*="card"]')).map(c => c.innerText.trim());
      const toasts = Array.from(document.querySelectorAll('[role="alert"], [class*="toast"], .fixed.bottom-5')).map(t => t.innerText.trim());
      const hasLoginForm = !!document.querySelector('input[type="password"]');
      const hasDashboard = !!document.querySelector('aside, nav, [class*="sidebar"]');
      const navItems = Array.from(document.querySelectorAll('aside button, nav button')).map(b => b.innerText.trim());
      return {
        headings,
        cardsCount: cards.length,
        navItems,
        toasts,
        hasLoginForm,
        hasDashboard,
        bodyTextSample: document.body.innerText.slice(0, 600)
      };
    });

    console.log('\n========================================');
    console.log('📊 LIVE E2E BROWSER TEST RESULTS');
    console.log('========================================');
    console.log('Has Login Form Still Visible:', pageContent.hasLoginForm);
    console.log('Has Dashboard Rendered:', pageContent.hasDashboard);
    console.log('Headings Detected:', pageContent.headings);
    console.log('Navigation Tabs:', pageContent.navItems);
    console.log('Cards Count:', pageContent.cardsCount);
    console.log('Toasts Observed:', pageContent.toasts);
    console.log('Visible Text Snippet:\n' + pageContent.bodyTextSample);
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await browser.close();
    console.log('🏁 Browser closed.');
  }
}

runTest();
