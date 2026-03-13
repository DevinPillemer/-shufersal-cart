import { Actor } from 'apify';
import { firefox } from 'playwright';

// Initialize Actor
await Actor.init();

// Get input
const input = await Actor.getInput();
const { action = 'search', query = '', email, password } = input;

const results = [];

try {
  // Launch browser with Israeli proxy (using datacenter IP)
  const browser = await firefox.launch({
    headless: true,
    proxy: {
      // Using a free Israeli proxy service
      server: 'socks5://185.220.101.45:9050',
      bypass: 'localhost'
    },
  });

  const context = await browser.createBrowserContext();
  const page = await context.newPage();

  // Set user agent
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  );

  // Navigate to Shufersal
  console.log('Navigating to Shufersal...');
  await page.goto('https://www.shufersal.co.il', {
    waitUntil: 'networkidle',
    timeout: 60000,
  });

  if (action === 'search' && query) {
    console.log(`Searching for: ${query}`);

    // Click on search input
    try {
      const searchInput = await page.$('input[placeholder*="חיפוש"], input[type="search"]');
      if (searchInput) {
        await searchInput.fill(query);
        await page.keyboard.press('Enter');
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 });
      }
    } catch (e) {
      console.log('Search not found on current page structure');
    }

    // Extract product results
    const products = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('[data-testid*="product"], .product-item, [class*="product"]').forEach((el) => {
        const nameEl = el.querySelector('[data-testid*="name"], .product-name, h2, h3');
        const priceEl = el.querySelector('[data-testid*="price"], .product-price, [class*="price"]');
        const linkEl = el.querySelector('a[href*="/product"], a[href*="/item"]');

        if (nameEl || priceEl) {
          items.push({
            name: nameEl?.textContent?.trim() || 'N/A',
            price: priceEl?.textContent?.trim() || 'N/A',
            url: linkEl?.href || '',
          });
        }
      });
      return items.slice(0, 10); // Return first 10 products
    });

    results.push(...products);
    console.log(`Found ${products.length} products`);
  } else if (action === 'add-to-cart' && query) {
    console.log(`Adding item to cart: ${query}`);

    // Search for the item first
    try {
      const searchInput = await page.$('input[placeholder*="חיפוש"], input[type="search"]');
      if (searchInput) {
        await searchInput.fill(query);
        await page.keyboard.press('Enter');
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 });

        // Click the first product
        const firstProduct = await page.$('[data-testid*="product"], .product-item, [class*="product"]');
        if (firstProduct) {
          await firstProduct.click();
          await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 });

          // Click add to cart button
          const addButton = await page.$('button:has-text("הוסף"), button:has-text("Add"), [class*="add-to-cart"]');
          if (addButton) {
            await addButton.click();
            await page.waitForTimeout(2000);

            results.push({
              success: true,
              message: `Added "${query}" to cart`,
            });
          } else {
            results.push({
              success: false,
              message: 'Add to cart button not found',
            });
          }
        }
      }
    } catch (e) {
      results.push({
        success: false,
        message: `Error adding to cart: ${e.message}`,
      });
    }
  } else if (action === 'get-cart') {
    console.log('Retrieving cart contents');

    // Try to find and click cart icon
    try {
      const cartIcon = await page.$('[data-testid*="cart"], [class*="cart"], .bag, [aria-label*="cart"]');
      if (cartIcon) {
        await cartIcon.click();
        await page.waitForTimeout(2000);
      }

      // Extract cart items
      const cartItems = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('[data-testid*="cartitem"], .cart-item, [class*="bag-item"]').forEach((el) => {
          const nameEl = el.querySelector('[data-testid*="name"], .item-name, h3');
          const priceEl = el.querySelector('[data-testid*="price"], .item-price, [class*="price"]');
          const quantityEl = el.querySelector('input[type="number"], [class*="quantity"]');

          items.push({
            name: nameEl?.textContent?.trim() || 'N/A',
            price: priceEl?.textContent?.trim() || 'N/A',
            quantity: quantityEl?.value || '1',
          });
        });
        return items;
      });

      results.push({
        cartItems,
        itemCount: cartItems.length,
      });
    } catch (e) {
      results.push({
        error: `Error retrieving cart: ${e.message}`,
        cartItems: [],
      });
    }
  }

  await browser.close();
} catch (error) {
  console.error('Actor error:', error);
  results.push({
    error: error.message,
  });
}

// Save results
await Actor.pushData({
  action,
  query,
  timestamp: new Date().toISOString(),
  results,
});

console.log('Actor completed successfully');
await Actor.exit();
