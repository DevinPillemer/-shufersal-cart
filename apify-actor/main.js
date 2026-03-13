import { Actor } from 'apify';
import { firefox } from 'playwright';

await Actor.init();

const input = await Actor.getInput();
const { action = 'search', query = '', email, password } = input;

const results = [];
const debugInfo = [];

try {
  const browser = await firefox.launch({
    headless: true,
  });

  const context = await browser.createBrowserContext();
  const page = await context.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  );

  console.log('🔗 Navigating to Shufersal...');
  await page.goto('https://www.shufersal.co.il', {
    waitUntil: 'networkidle',
    timeout: 60000,
  });

  // Debug: Get page structure
  const pageInfo = await page.evaluate(() => {
    return {
      title: document.title,
      bodyText: document.body.innerText.slice(0, 500),
      allButtons: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).slice(0, 5),
      allInputs: Array.from(document.querySelectorAll('input')).map(i => ({type: i.type, placeholder: i.placeholder})).slice(0, 5),
      allClasses: Array.from(new Set(Array.from(document.querySelectorAll('[class]')).map(e => e.className))).slice(0, 10),
    };
  });
  
  debugInfo.push({stage: 'page_load', info: pageInfo});

  if (action === 'search' && query) {
    console.log(`🔍 Searching for: ${query}`);
    
    // More robust search
    const searchInput = await page.$('input[placeholder*="חיפוש"], input[type="search"], input[placeholder*="search"], input[id*="search"]');
    if (searchInput) {
      await searchInput.fill(query);
      await page.keyboard.press('Enter');
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    }

    const products = await page.evaluate(() => {
      const items = [];
      // Try multiple selector strategies
      const productElements = document.querySelectorAll(
        '[data-testid*="product"], .product-item, [class*="product"], article, .tile, [class*="card"]'
      );
      
      productElements.forEach((el) => {
        const text = el.textContent?.trim();
        if (text && text.length > 0) {
          items.push({text: text.slice(0, 100)});
        }
      });
      
      return items.slice(0, 5);
    });

    results.push(...products);
    console.log(`✅ Found ${products.length} products`);

  } else if (action === 'add-to-cart' && query) {
    console.log(`➕ Adding to cart: ${query}`);

    // Try to search first
    const searchInput = await page.$('input[placeholder*="חיפוש"], input[type="search"], input[id*="search"]');
    if (searchInput) {
      await searchInput.fill(query);
      await page.keyboard.press('Enter');
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    }

    // Find and click first product
    const firstProductBtn = await page.$('button:has-text("הוסף"), button:has-text("Add"), [class*="add"]');
    if (firstProductBtn) {
      await firstProductBtn.click();
      await page.waitForTimeout(2000);
      results.push({success: true, message: `Added "${query}" to cart`});
    } else {
      results.push({success: false, message: 'Add button not found'});
    }

  } else if (action === 'get-cart') {
    console.log('🛒 Getting cart...');

    // Navigate to cart directly
    await page.goto('https://www.shufersal.co.il/secure/cart', {
      waitUntil: 'networkidle',
      timeout: 30000,
    }).catch(() => {});

    const cartData = await page.evaluate(() => {
      const items = [];
      const allText = document.body.innerText;
      
      // Try to find any product info on the page
      document.querySelectorAll('tr, [class*="item"], [data-testid*="item"]').forEach((el) => {
        const text = el.textContent?.trim();
        if (text && text.length > 10 && text.length < 500) {
          items.push({text: text.slice(0, 150)});
        }
      });

      return {
        itemCount: items.length,
        items: items.slice(0, 5),
        pageHasCart: allText.includes('סל') || allText.includes('cart') || allText.includes('כמות')
      };
    });

    results.push(cartData);
    console.log(`Cart info: ${JSON.stringify(cartData)}`);
  }

  await browser.close();

} catch (error) {
  console.error('❌ Actor error:', error.message);
  results.push({error: error.message});
}

// Return results with debug info
await Actor.pushData({
  action,
  query,
  timestamp: new Date().toISOString(),
  success: !results.some(r => r.error),
  results,
  debug: debugInfo,
});

console.log('✅ Actor completed');
await Actor.exit();
