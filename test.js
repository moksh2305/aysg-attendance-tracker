import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    for (let i = 0; i < msg.args().length; ++i)
      console.log(`${i}: ${msg.args()[i]}`);
  });
  
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error));

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log("Page loaded successfully.");
  } catch (err) {
    console.log("Error loading page:", err.message);
  }

  await browser.close();
})();
