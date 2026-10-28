import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// /api/preview?url=<encoded_preview_url>
// Proxies iTunes/Apple Music 30-second preview audio to avoid CORS issues.
// Streams the audio bytes directly from Apple's CDN.
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_HOSTS = [
  'audio-ssl.itunes.apple.com',
  'a1.mzstatic.com',
  'is1-ssl.mzstatic.com',
  'is2-ssl.mzstatic.com',
  'is3-ssl.mzstatic.com',
  'is4-ssl.mzstatic.com',
  'is5-ssl.mzstatic.com',
  'cdn-preview-d.dzcdn.net',
  'cdn-preview-e.dzcdn.net',
  'cdns-preview-d.dzcdn.net',
  'cdns-preview-e.dzcdn.net',
];

function isAllowedUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    if (url.protocol !== 'https:') return false;
    return ALLOWED_HOSTS.some(h => url.hostname === h || url.hostname.endsWith('.' + h));
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url');

  if (!raw) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }

  const decoded = decodeURIComponent(raw);

  if (!isAllowedUrl(decoded)) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
  }

  try {
    const rangeHeader = req.headers.get('range');
    const upstreamHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (compatible; Roomtone/1.0)',
      'Accept': 'audio/*,*/*',
    };
    if (rangeHeader) upstreamHeaders['Range'] = rangeHeader;

    const upstream = await fetch(decoded, { headers: upstreamHeaders });

    if (!upstream.ok && upstream.status !== 206) {
      return NextResponse.json(
        { error: `Upstream returned ${upstream.status}` },
        { status: upstream.status }
      );
    }

    const contentType = upstream.headers.get('content-type') ?? 'audio/mpeg';
    const contentLength = upstream.headers.get('content-length');
    const contentRange = upstream.headers.get('content-range');
    const acceptRanges = upstream.headers.get('accept-ranges');

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    };
    if (contentLength) headers['Content-Length'] = contentLength;
    if (contentRange)  headers['Content-Range']  = contentRange;
    if (acceptRanges)  headers['Accept-Ranges']  = acceptRanges;

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (err) {
    console.error('[/api/preview] Proxy error:', err);
    return NextResponse.json({ error: 'Proxy fetch failed' }, { status: 502 });
  }
}
