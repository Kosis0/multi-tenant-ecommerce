const puppeteer = require('puppeteer-core');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ARTIFACT_DIR = 'C:\\Users\\kosiu\\.gemini\\antigravity\\brain\\2bb98b17-83c1-4359-8f54-568a2550b76d';

async function runLiveTest() {
  console.log('🚀 Launching Edge to test live Vercel deployment...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[LIVE CONSOLE] ${msg.type()}: ${msg.text()}`));

  try {
    const liveUrl = 'https://multi-tenant-ecommerce-nine.vercel.app/nike/admin';
    console.log(`📡 Navigating to live Vercel: ${liveUrl}...`);
    await page.goto(liveUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Type credentials
    const inputs = await page.$$('input');
    await inputs[0].type('owner@nike.com');
    await inputs[1].type('admin123');

    const buttons = await page.$$('button');
    await buttons[buttons.length - 1].click();

    console.log('⏳ Waiting for live state transition...');
    await new Promise(r => setTimeout(r, 4000));

    // Capture screenshot of live Vercel
    const liveScreenshotPath = path.join(ARTIFACT_DIR, 'live_vercel_dashboard.png');
    await page.screenshot({ path: liveScreenshotPath, fullPage: true });
    console.log(`📸 Captured live Vercel screenshot at ${liveScreenshotPath}`);

    const result = await page.evaluate(() => {
      const hasLoginForm = !!document.querySelector('input[type="password"]');
      const hasDashboard = !!document.querySelector('aside, nav, [class*="sidebar"]');
      const toasts = Array.from(document.querySelectorAll('[role="alert"], [class*="toast"], .fixed.bottom-5')).map(t => t.innerText.trim());
      const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText.trim());
      return { hasLoginForm, hasDashboard, toasts, headings };
    });

    console.log('\n========================================');
    console.log('🌐 LIVE VERCEL DEPLOYMENT AUDIT');
    console.log('========================================');
    console.log('Has Login Form:', result.hasLoginForm);
    console.log('Has Dashboard Rendered:', result.hasDashboard);
    console.log('Headings:', result.headings);
    console.log('Toasts Observed:', result.toasts);
    console.log('Console Logs:\n' + consoleLogs.join('\n'));
    console.log('========================================\n');

  } catch (err) {
    console.error('❌ Live test error:', err);
  } finally {
    await browser.close();
  }
}

runLiveTest();
