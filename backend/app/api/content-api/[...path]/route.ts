import { NextResponse } from 'next/server';

export const runtime = 'node';

const CONTENT_API_BASE = 'https://api.quran.com/api/v4';

async function proxyRequest(request: Request, pathSegments: string[]) {
  const targetPath = pathSegments.join('/');
  const url = new URL(`${CONTENT_API_BASE}/${targetPath}`);
  const originalUrl = new URL(request.url);

  originalUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key === 'host') return;
    headers.set(key, value);
  });

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual'
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }

  const upstream = await fetch(url.toString(), init);
  const responseBody = await upstream.text();
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.set('x-proxied-by', 'quran-backend');

  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: responseHeaders
  });
}

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path ?? []);
}

export async function POST(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path ?? []);
}

export async function PUT(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path ?? []);
}

export async function DELETE(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path ?? []);
}

export async function PATCH(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path ?? []);
}
