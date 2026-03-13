import { Actor, Dataset } from 'apify';
import { PlaywrightCrawler } from 'crawlee';

await Actor.init();
const input = await Actor.getInput();
const { action = 'get-cart', query = '' } = input || {};

try {
  const crawler = new PlaywrightCrawler({
    headless: true,
    launchContext: {
      launchOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    },
    async requestHandler({ page, request }) {
      await page.waitForLoadState('networkidle');
      
      const pageTitle = await page.title();
      const bodyText = await page.locator('body').textContent();
      
      // Wait a bit for dynamic content
      await page.waitForTimeout(1000);
      
      const items = await page.evaluate(() => {
        const result = [];
        document.querySelectorAll('*').forEach((el) => {
          const text = el.textContent?.trim();
          if (text && text.length > 20 && text.length < 200) {
            result.push(text);
          }
        });
        return result.slice(0, 10);
      });

      await Dataset.pushData({
        action,
        query,
        success: true,
        pageTitle,
        url: request.url,
        itemsFound: items.length,
        items: items,
        bodyPreview: bodyText?.slice(0, 200),
        timestamp: new Date().toISOString()
      });
    },
  });

  const targetUrl = action === 'get-cart' 
    ? 'https://www.shufersal.co.il/secure/cart'
    : 'https://www.shufersal.co.il';

  await crawler.run([{ url: targetUrl }]);
} catch (error) {
  await Dataset.pushData({
    error: error.message,
    action,
    success: false
  });
}

await Actor.exit();
