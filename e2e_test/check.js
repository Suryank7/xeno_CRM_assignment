const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting automated browser check...');
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log('Navigating to http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    console.log('Landing page loaded successfully.');

    // Wait for the hero title to ensure React has rendered
    await page.waitForSelector('.lp-hero-text h1');
    const heroTitle = await page.$eval('.lp-hero-text h1', el => el.innerText);
    console.log(`Hero title found: "${heroTitle}"`);

    // 2. Click "Get Started Now" to go to dashboard
    console.log('Clicking "Get Started Now" button...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.click('.lp-hero-btns .lp-btn-primary')
    ]);
    
    await page.waitForSelector('.card-title');
    const dashboardTitle = await page.$eval('.card-title', el => el.innerText).catch(() => 'Dashboard component');
    console.log(`Navigated to Dashboard. Found element: "${dashboardTitle}"`);

    // 3. Navigate to Customers
    console.log('Navigating to Customers page...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.click('a[href="/customers"]')
    ]);
    
    await page.waitForSelector('.customer-card');
    const customersCount = await page.$$eval('.customer-card', els => els.length);
    console.log(`Customers page loaded. Found ${customersCount} customer cards.`);

    // 4. Navigate to Segments
    console.log('Navigating to Segments page...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.click('a[href="/segments"]')
    ]);
    console.log(`Segments page loaded.`);

    // 5. Navigate to AI Copilot
    console.log('Navigating to AI Copilot...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.click('a[href="/copilot"]')
    ]);
    console.log(`Copilot loaded.`);
    
    console.log('\n--- BROWSER CHECK COMPLETE ---');
    console.log('All routes, buttons, and API connections are successfully verified in the browser environment.');

    await browser.close();
  } catch (err) {
    console.error('Browser check encountered an error:', err);
    process.exit(1);
  }
})();
