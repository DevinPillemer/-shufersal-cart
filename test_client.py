#!/usr/bin/env python3
"""
Shufersal Cart Automation - Python Test Client

Usage:
    python test_client.py --search "milk"
    python test_client.py --add-to-cart "cheese"
    python test_client.py --get-cart
"""

import requests
import json
import argparse
import sys
from typing import Optional, Any

# Configuration
BASE_URL = "https://shufersal-cart.vercel.app/api/shufersal"
LOCAL_URL = "http://localhost:3000/api/shufersal"  # For local testing

class ShufshalClient:
    """Client for Shufersal cart automation API"""

    def __init__(self, base_url: str = BASE_URL, use_local: bool = False):
        """Initialize client with API endpoint"""
        self.base_url = LOCAL_URL if use_local else base_url
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
        })

    def search(self, query: str) -> dict[str, Any]:
        """Search for products"""
        print(f"🔍 Searching for: {query}")
        response = self.session.post(
            self.base_url,
            json={"action": "search", "query": query},
            timeout=120
        )
        return self._handle_response(response)

    def add_to_cart(self, query: str) -> dict[str, Any]:
        """Add item to cart"""
        print(f"🛒 Adding to cart: {query}")
        response = self.session.post(
            self.base_url,
            json={"action": "add-to-cart", "query": query},
            timeout=120
        )
        return self._handle_response(response)

    def get_cart(self) -> dict[str, Any]:
        """Get current cart contents"""
        print("📦 Retrieving cart...")
        response = self.session.post(
            self.base_url,
            json={"action": "get-cart"},
            timeout=120
        )
        return self._handle_response(response)

    def _handle_response(self, response: requests.Response) -> dict[str, Any]:
        """Handle API response"""
        try:
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    print(f"✅ Success: {data.get('message', 'Operation completed')}")
                else:
                    print(f"⚠️  Status: {data.get('status', 'FAILED')}")
                return data
            else:
                error_data = response.json()
                error_msg = error_data.get("message", response.text)
                print(f"❌ Error ({response.status_code}): {error_msg}")
                return {
                    "success": False,
                    "error": error_msg,
                    "status_code": response.status_code
                }
        except requests.exceptions.JSONDecodeError:
            print(f"❌ Invalid JSON response: {response.text}")
            return {
                "success": False,
                "error": "Invalid JSON response",
                "status_code": response.status_code
            }
        except requests.exceptions.RequestException as e:
            print(f"❌ Request error: {e}")
            return {
                "success": False,
                "error": str(e)
            }

def print_results(data: dict[str, Any]) -> None:
    """Pretty print results"""
    print("\n" + "="*60)
    print("RESPONSE:")
    print("="*60)
    print(json.dumps(data, indent=2, ensure_ascii=False))
    print("="*60 + "\n")

def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Shufersal Shopping Cart Automation Test Client"
    )

    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--search",
        metavar="QUERY",
        help="Search for products"
    )
    group.add_argument(
        "--add-to-cart",
        metavar="ITEM",
        help="Add item to cart"
    )
    group.add_argument(
        "--get-cart",
        action="store_true",
        help="Get cart contents"
    )

    parser.add_argument(
        "--local",
        action="store_true",
        help="Use local development server (http://localhost:3000)"
    )

    parser.add_argument(
        "--url",
        help="Custom API endpoint URL"
    )

    args = parser.parse_args()

    # Initialize client
    if args.url:
        client = ShufshalClient(base_url=args.url)
    else:
        client = ShufshalClient(use_local=args.local)

    print(f"\n🚀 Shufersal Cart Automation Client")
    print(f"📍 Endpoint: {client.base_url}\n")

    try:
        if args.search:
            result = client.search(args.search)
            print_results(result)

            if result.get("results"):
                print(f"\n📋 Found {len(result['results'])} products:\n")
                for i, product in enumerate(result["results"], 1):
                    name = product.get("name", "Unknown")
                    price = product.get("price", "N/A")
                    print(f"  {i}. {name} - {price}")

        elif args.add_to_cart:
            result = client.add_to_cart(args.add_to_cart)
            print_results(result)

        elif args.get_cart:
            result = client.get_cart()
            print_results(result)

            if "cartItems" in result and result["cartItems"]:
                print(f"\n🛒 Cart Items ({result.get('itemCount', 0)}):\n")
                for i, item in enumerate(result["cartItems"], 1):
                    name = item.get("name", "Unknown")
                    price = item.get("price", "N/A")
                    qty = item.get("quantity", "1")
                    print(f"  {i}. {name} (x{qty}) - {price}")

    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
