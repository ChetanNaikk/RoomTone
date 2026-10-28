import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// /api/search?q=<query>&limit=<n>
// Server-side iTunes search proxy — avoids browser CORS on itunes.apple.com
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const q     = req.nextUrl.searchParams.get('q');
  const limit = req.nextUrl.searchParams.get('limit') ?? '15';

  if (!q || q.trim().length < 1) {
    return NextResponse.json({ results: [] });
  }

  const url = new URL('https://itunes.apple.com/search');
  url.searchParams.set('term', q.trim());
  url.searchParams.set('media', 'music');
  url.searchParams.set('entity', 'song');
  url.searchParams.set('limit', limit);

  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'Roomtone/1.0' },
      next: { revalidate: 60 }, // cache for 60s
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'iTunes API error', results: [] }, { status: res.status });
    }

    const data = await res.json();

    // Filter to tracks with preview URLs + normalize artwork
    const results = (data.results ?? [])
      .filter((r: { previewUrl?: string }) => !!r.previewUrl)
      .map((r: {
        trackId: number;
        trackName: string;
        artistName: string;
        artworkUrl100: string;
        previewUrl: string;
        collectionName?: string;
        trackTimeMillis?: number;
      }) => ({
        trackId: r.trackId,
        trackName: r.trackName,
        artistName: r.artistName,
        // Upgrade to 300x300 artwork
        artworkUrl100: r.artworkUrl100.replace('100x100bb', '300x300bb'),
        previewUrl: r.previewUrl,
        collectionName: r.collectionName,
        trackTimeMillis: r.trackTimeMillis,
      }));

    return NextResponse.json({ results }, {
      headers: { 'Cache-Control': 'public, s-maxage=60' },
    });
  } catch (err) {
    console.error('[/api/search]', err);
    return NextResponse.json({ error: 'Search failed', results: [] }, { status: 502 });
  }
}
