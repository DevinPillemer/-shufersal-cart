'use client';

import { useState } from 'react';

interface ApiResponse {
  success: boolean;
  status: string;
  action: string;
  query: string;
  results: unknown[];
  message: string;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [action, setAction] = useState<
    'search' | 'add-to-cart' | 'get-cart'
  >('search');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/shufersal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          query,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || `API error: ${res.statusText}`
        );
      }

      const data: ApiResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Shufersal Cart Automation
          </h1>
          <p className="text-gray-600 mb-8">
            Automated shopping cart management powered by Apify
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <select
                value={action}
                onChange={(e) =>
                  setAction(
                    e.target.value as
                      | 'search'
                      | 'add-to-cart'
                      | 'get-cart'
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="search">Search Products</option>
                <option value="add-to-cart">Add to Cart</option>
                <option value="get-cart">Get Cart Contents</option>
              </select>
            </div>

            {action !== 'get-cart' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Query
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    action === 'search'
                      ? 'Search for products...'
                      : 'Product ID or name...'
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {loading ? 'Processing...' : 'Execute'}
            </button>
          </form>

          {error && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Error
              </h2>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {response && (
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h2 className="text-lg font-semibold text-green-800 mb-4">
                Response
              </h2>
              <div className="space-y-2 mb-4">
                <p>
                  <strong>Status:</strong> {response.status}
                </p>
                <p>
                  <strong>Action:</strong> {response.action}
                </p>
                <p>
                  <strong>Message:</strong> {response.message}
                </p>
              </div>
              {response.results.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Results ({response.results.length})
                  </h3>
                  <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
                    {JSON.stringify(response.results, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            API Usage
          </h2>
          <div className="space-y-4 text-sm text-gray-700">
            <p>
              <strong>Endpoint:</strong> POST /api/shufersal
            </p>
            <p>
              <strong>Request body:</strong>
            </p>
            <pre className="bg-gray-100 p-3 rounded">
              {JSON.stringify(
                {
                  action: 'search | add-to-cart | get-cart',
                  query: 'product search term or product id',
                },
                null,
                2
              )}
            </pre>
            <p>
              <strong>Example curl:</strong>
            </p>
            <pre className="bg-gray-100 p-3 rounded">
              {`curl -X POST https://shufersal-cart.vercel.app/api/shufersal \\
  -H "Content-Type: application/json" \\
  -d '{"action":"search","query":"milk"}'`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
