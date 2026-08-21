const puppeteer = require('puppeteer-core');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function testFavicon() {
  console.log('🚀 Checking Favicon and Metadata in Admin Portal...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3000/nike/admin', { waitUntil: 'networkidle2' });

    const metadata = await page.evaluate(() => {
      const title = document.title;
      const iconLinks = Array.from(document.querySelectorAll('link[rel*="icon"]')).map(l => ({
        rel: l.getAttribute('rel'),
        href: l.getAttribute('href'),
        type: l.getAttribute('type')
      }));
      return { title, iconLinks };
    });

    console.log('📌 Page Title:', metadata.title);
    console.log('📌 Favicon Links:', metadata.iconLinks);

  } catch (err) {
    console.error('❌ Error checking favicon:', err);
  } finally {
    await browser.close();
  }
}

testFavicon();
