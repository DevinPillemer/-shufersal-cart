import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface ApifyRunPayload {
  query?: string;
  action?: 'add-to-cart' | 'get-cart' | 'search';
}

interface ApifyRunResponse {
  data: {
    id: string;
    status: string;
    startedAt: string;
    finishedAt?: string;
    statusMessage?: string;
    output?: {
      body: unknown[];
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ApifyRunPayload = await request.json();
    const { action = 'search', query = '' } = body;

    const apiKey = process.env.APIFY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'APIFY_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Call Apify actor to interact with Shufersal
    const apifyResponse = await axios.post<ApifyRunResponse>(
      `https://api.apify.com/v2/acts/devinpillemer~shufersal-cart/runs`,
      {
        query,
        action,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 120000, // 2 minutes for scraping
      }
    );

    // Wait for the run to complete (poll)
    const runId = apifyResponse.data.data.id;
    let completed = false;
    let runData = apifyResponse.data.data;
    let attempts = 0;
    const maxAttempts = 60; // 60 attempts * 2 seconds = 2 minutes max wait

    while (!completed && attempts < maxAttempts) {
      const statusResponse = await axios.get<ApifyRunResponse>(
        `https://api.apify.com/v2/acts/devinpillemer~shufersal-cart/runs/${runId}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      runData = statusResponse.data.data;

      if (
        runData.status === 'SUCCEEDED' ||
        runData.status === 'FAILED' ||
        runData.status === 'ABORTED'
      ) {
        completed = true;
      } else {
        // Wait 2 seconds before polling again
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;
      }
    }

    // Extract the results
    const results = runData.output?.body || [];

    return NextResponse.json({
      success: runData.status === 'SUCCEEDED',
      status: runData.status,
      action,
      query,
      results,
      message:
        runData.status === 'SUCCEEDED'
          ? 'Operation completed successfully'
          : runData.statusMessage,
    });
  } catch (error) {
    console.error('Shufersal API error:', error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          error: 'Apify API error',
          message: error.message,
          status: error.response?.status,
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action') || 'get-cart';

  return POST(
    new NextRequest(request, {
      method: 'POST',
      body: JSON.stringify({ action }),
    })
  );
}
