# Shufersal Shopping Cart Automation

Automated shopping cart management for Shufersal supermarket using Next.js API and Apify web scraping.

## Features

- **Search Products**: Search for items on Shufersal's website
- **Add to Cart**: Automatically add products to your shopping cart
- **Get Cart**: Retrieve current cart contents
- **Apify Integration**: Uses Apify actors with Playwright for reliable scraping
- **Israeli Proxy Support**: Bypasses geo-restrictions using Israeli proxies
- **REST API**: Simple POST endpoint for automation

## Deployment

### Prerequisites

- Node.js 18+
- Vercel account
- GitHub account
- Apify account (for deploying actor)

### Environment Variables

Create `.env.local`:

```
APIFY_API_KEY=your_apify_api_key_here
SHUFERSAL_EMAIL=devin.pillemer@gmail.com
SHUFERSAL_PASSWORD=your_password_here
```

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Deploy Apify Actor

1. Create an Apify account at https://apify.com
2. Create a new actor and upload the `apify-actor/` directory
3. Configure environment variables in Apify console:
   - `SHUFERSAL_EMAIL=devin.pillemer@gmail.com`
   - `SHUFERSAL_PASSWORD=your_password`
4. Copy the actor ID and configure in Next.js

## API Usage

### POST /api/shufersal

**Search for products:**

```bash
curl -X POST https://shufersal-cart.vercel.app/api/shufersal \
  -H "Content-Type: application/json" \
  -d '{"action":"search","query":"milk"}'
```

**Add item to cart:**

```bash
curl -X POST https://shufersal-cart.vercel.app/api/shufersal \
  -H "Content-Type: application/json" \
  -d '{"action":"add-to-cart","query":"1%20milk"}'
```

**Get cart contents:**

```bash
curl -X POST https://shufersal-cart.vercel.app/api/shufersal \
  -H "Content-Type: application/json" \
  -d '{"action":"get-cart"}'
```

### Response Format

```json
{
  "success": true,
  "status": "SUCCEEDED",
  "action": "search",
  "query": "milk",
  "results": [
    {
      "name": "חלב תנובה 3%",
      "price": "₪8.90",
      "url": "https://www.shufersal.co.il/..."
    }
  ],
  "message": "Operation completed successfully"
}
```

## Project Structure

```
shufersal-cart/
├── app/
│   ├── api/
│   │   └── shufersal/
│   │       └── route.ts       # API endpoint
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page UI
├── apify-actor/
│   ├── main.js                 # Actor main script
│   └── package.json            # Actor dependencies
├── styles/
│   └── globals.css             # Global styles
├── package.json                # Next.js dependencies
├── next.config.ts              # Next.js configuration
└── tsconfig.json               # TypeScript configuration
```

## Testing with Python Client

```python
import requests
import json

BASE_URL = "https://shufersal-cart.vercel.app/api/shufersal"

# Search
response = requests.post(BASE_URL, json={
    "action": "search",
    "query": "חלב"
})
print(json.dumps(response.json(), indent=2, ensure_ascii=False))

# Add to cart
response = requests.post(BASE_URL, json={
    "action": "add-to-cart",
    "query": "חלב תנובה"
})
print(json.dumps(response.json(), indent=2, ensure_ascii=False))

# Get cart
response = requests.post(BASE_URL, json={
    "action": "get-cart"
})
print(json.dumps(response.json(), indent=2, ensure_ascii=False))
```

## Architecture

```
┌─────────────────────────┐
│  Python/JavaScript      │
│  Client Application     │
└────────────┬────────────┘
             │ HTTP POST
             ▼
┌─────────────────────────┐
│  Vercel (Next.js)       │
│  /api/shufersal         │
│  Route Handler          │
└────────────┬────────────┘
             │ REST API Call
             ▼
┌─────────────────────────┐
│  Apify Platform         │
│  Shufersal Actor        │
│  (Playwright + Proxy)   │
└────────────┬────────────┘
             │ Browser Automation
             ▼
┌─────────────────────────┐
│  Shufersal Website      │
│  + Israeli Proxy        │
└─────────────────────────┘
```

## Notes

- The actor uses Playwright for reliable browser automation
- Israeli proxy support for geo-restricted content
- Results are cached during the run (max 2 minutes per request)
- Apify provides monitoring and error tracking
- Vercel auto-scales based on traffic

## Future Enhancements

- [ ] Database for saving cart state
- [ ] Email notifications when items are on sale
- [ ] Multi-account support
- [ ] Price history tracking
- [ ] Scheduled shopping (time-based automation)
- [ ] WebSocket support for real-time updates

## Support

For issues or questions, open a GitHub issue or contact the developer.

## License

MIT
