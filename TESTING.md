# Testing Guide - Shufersal Cart Automation

## Prerequisites

- Python 3.8+
- `requests` library: `pip install requests`
- Local development server running OR Vercel deployment live

## Local Testing Setup

### Start Development Server

```bash
cd /root/.openclaw/workspace/shufersal-cart

# Install dependencies (if not done)
npm install

# Start dev server
npm run dev

# Server runs at http://localhost:3000
```

### Environment Setup

Create `.env.local`:

```env
APIFY_API_KEY=apify_api_mcfb4aow8T53M0md8weNg16hhdAFKi1lMCV8
SHUFERSAL_EMAIL=devin.pillemer@gmail.com
SHUFERSAL_PASSWORD=Shufersal88
```

## Test Methods

### Method 1: Using Python Client (Recommended)

#### Basic Usage

```bash
# Make sure you're in the project directory
cd /root/.openclaw/workspace/shufersal-cart

# Search for products
python3 test_client.py --search "חלב"

# Add item to cart
python3 test_client.py --add-to-cart "חלב תנובה"

# Get cart contents
python3 test_client.py --get-cart
```

#### Local Testing

```bash
# Test against local dev server
python3 test_client.py --search "milk" --local

# Test against production
python3 test_client.py --search "milk"

# Test against custom endpoint
python3 test_client.py --search "milk" --url "https://shufersal-cart.vercel.app/api/shufersal"
```

#### Advanced Testing

```bash
# Search Hebrew products
python3 test_client.py --search "חלב"

# Search English products
python3 test_client.py --search "milk"

# Add specific item
python3 test_client.py --add-to-cart "tenuva milk 3%"

# Get cart (no query needed)
python3 test_client.py --get-cart
```

### Method 2: Using cURL

#### Search

```bash
curl -X POST http://localhost:3000/api/shufersal \
  -H "Content-Type: application/json" \
  -d '{"action":"search","query":"milk"}'
```

#### Add to Cart

```bash
curl -X POST http://localhost:3000/api/shufersal \
  -H "Content-Type: application/json" \
  -d '{"action":"add-to-cart","query":"cheese"}'
```

#### Get Cart

```bash
curl -X POST http://localhost:3000/api/shufersal \
  -H "Content-Type: application/json" \
  -d '{"action":"get-cart"}'
```

### Method 3: Using Web UI

1. Open http://localhost:3000
2. Select action from dropdown:
   - Search Products
   - Add to Cart
   - Get Cart Contents
3. Enter query if needed
4. Click "Execute"
5. View results in JSON format

## Test Cases

### Test Case 1: Basic Search

```python
# Local test
python3 test_client.py --search "milk" --local
```

**Expected Result:**
- Status: "SUCCEEDED"
- Results: Array of products with name, price, url
- Message: "Operation completed successfully"

**Success Criteria:**
- ✅ No errors
- ✅ At least 1-5 products found
- ✅ Each product has name and price

### Test Case 2: Hebrew Search

```python
python3 test_client.py --search "חלב" --local
```

**Expected Result:**
- Status: "SUCCEEDED"
- Results: Array of Hebrew product names
- Message: "Operation completed successfully"

**Success Criteria:**
- ✅ Hebrew characters preserved
- ✅ Products found
- ✅ Response time < 120 seconds

### Test Case 3: No Results Found

```python
python3 test_client.py --search "xyznonexistent" --local
```

**Expected Result:**
- Status: "SUCCEEDED" (no error, just empty results)
- Results: [] (empty array)
- Message: "Operation completed successfully"

**Success Criteria:**
- ✅ Handles gracefully
- ✅ No error status
- ✅ Empty results array

### Test Case 4: Add to Cart

```python
python3 test_client.py --add-to-cart "milk" --local
```

**Expected Result:**
- Status: "SUCCEEDED"
- Message: "Added 'milk' to cart" (or similar)
- Results: Cart confirmation

**Success Criteria:**
- ✅ No errors
- ✅ Confirmation message
- ✅ Response time < 120 seconds

### Test Case 5: Get Cart Contents

```python
python3 test_client.py --get-cart --local
```

**Expected Result:**
- Status: "SUCCEEDED"
- Results: Array of cart items with:
  - name
  - price
  - quantity
- Message: "Operation completed successfully"

**Success Criteria:**
- ✅ No errors
- ✅ Cart items (if any) listed
- ✅ Item format is consistent

### Test Case 6: Error Handling

```python
python3 test_client.py --search "" --local
```

**Expected Result:**
- Either empty results or helpful error message
- No 500 status code

**Success Criteria:**
- ✅ Graceful error handling
- ✅ Clear error message
- ✅ Application doesn't crash

## Performance Testing

### Response Time Measurement

```bash
# Using curl with time measurement
time curl -X POST http://localhost:3000/api/shufersal \
  -H "Content-Type: application/json" \
  -d '{"action":"search","query":"milk"}' > /dev/null

# Expected: 2-5 seconds for local dev
# Expected: 15-60 seconds for Vercel + Apify
```

### Load Testing

```bash
# Install Apache Bench
apt-get install apache2-utils

# Test with 10 concurrent requests
ab -n 100 -c 10 -p data.json \
  -T "application/json" \
  http://localhost:3000/api/shufersal
```

**Test Data** (`data.json`):
```json
{"action":"search","query":"milk"}
```

## Monitoring Responses

### Check API Response Schema

```python
python3 -c "
import requests
import json

response = requests.post(
    'http://localhost:3000/api/shufersal',
    json={'action': 'search', 'query': 'milk'}
)

data = response.json()
print('Status Code:', response.status_code)
print('Response Keys:', list(data.keys()))
print('Full Response:')
print(json.dumps(data, indent=2))
"
```

### Validate JSON Schema

```bash
# Check if response is valid JSON
curl -s http://localhost:3000/api/shufersal \
  -H "Content-Type: application/json" \
  -d '{"action":"get-cart"}' | python3 -m json.tool
```

## Troubleshooting Tests

### Issue: Connection Refused

```
Error: Unable to connect to http://localhost:3000
```

**Solution:**
```bash
# Check if dev server is running
npm run dev

# Check if port 3000 is in use
lsof -i :3000
```

### Issue: API Returns 500 Error

```
{"error": "APIFY_API_KEY not configured"}
```

**Solution:**
```bash
# Create .env.local
cat > .env.local << EOF
APIFY_API_KEY=apify_api_mcfb4aow8T53M0md8weNg16hhdAFKi1lMCV8
SHUFERSAL_EMAIL=devin.pillemer@gmail.com
SHUFERSAL_PASSWORD=Shufersal88
EOF

# Restart dev server
npm run dev
```

### Issue: Timeout After 120 Seconds

```
{"error": "Request timeout"}
```

**Solution:**
- Apify actors can take 2-5 minutes
- Increase timeout in test_client.py:
```python
response = self.session.post(
    self.base_url,
    json={"action": "search", "query": query},
    timeout=300  # Increase from 120 to 300 seconds
)
```

### Issue: Rate Limiting

```
{"error": "429 Too Many Requests"}
```

**Solution:**
- Add delay between requests:
```python
import time
requests.post(url, json=data)
time.sleep(5)  # Wait 5 seconds
```

## CI/CD Testing

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Lint
        run: npm run lint
```

## Test Automation Script

Create `run_tests.sh`:

```bash
#!/bin/bash

echo "🧪 Running Shufersal Cart Tests"

# Test 1: Search
echo -e "\n✓ Test 1: Search"
python3 test_client.py --search "milk" --local

# Test 2: Hebrew Search
echo -e "\n✓ Test 2: Hebrew Search"
python3 test_client.py --search "חלב" --local

# Test 3: Add to Cart
echo -e "\n✓ Test 3: Add to Cart"
python3 test_client.py --add-to-cart "milk" --local

# Test 4: Get Cart
echo -e "\n✓ Test 4: Get Cart"
python3 test_client.py --get-cart --local

echo -e "\n✅ All tests completed!"
```

Run tests:
```bash
chmod +x run_tests.sh
./run_tests.sh
```

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Search Response Time | <5s | TBD |
| Add to Cart Success Rate | >95% | TBD |
| API Uptime | >99% | TBD |
| Build Time | <3 min | TBD |
| Deployment Success | 100% | TBD |

## Test Report Template

```markdown
# Test Report - YYYY-MM-DD

## Environment
- URL: http://localhost:3000
- Branch: main
- Commit: abc1234

## Results
| Test Case | Status | Notes |
|-----------|--------|-------|
| Search (English) | ✅ PASS | Found 5 products |
| Search (Hebrew) | ✅ PASS | No encoding issues |
| Add to Cart | ✅ PASS | Item added successfully |
| Get Cart | ✅ PASS | 1 item in cart |
| Error Handling | ✅ PASS | Graceful errors |

## Performance
- Average Response Time: X.XXs
- Max Response Time: X.XXs
- Timeouts: 0

## Issues
None

## Recommendations
None
```

## Contact & Support

For test failures:
1. Check `.env.local` is configured
2. Verify dev server is running
3. Review Apify actor status
4. Check browser console for errors
5. Review `/tmp/shufersal-*.log` for details
