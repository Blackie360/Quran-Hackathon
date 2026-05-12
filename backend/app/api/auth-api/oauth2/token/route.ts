import { NextResponse } from 'next/server';

export const runtime = 'node';

const TARGET_URL = 'https://oauth2.quran.foundation/oauth2/token';

export async function POST(request: Request) {
  const bodyText = await request.text();
  const headers = new Headers();
  const authorization = request.headers.get('authorization');

  if (authorization) {
    headers.set('Authorization', authorization);
  }
  headers.set('Content-Type', request.headers.get('content-type') ?? 'application/x-www-form-urlencoded');

  const upstream = await fetch(TARGET_URL, {
    method: 'POST',
    headers,
    body: bodyText
  });

  const responseText = await upstream.text();
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.set('x-proxied-by', 'quran-backend');

  return new NextResponse(responseText, {
    status: upstream.status,
    headers: responseHeaders
  });
}
