import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import type { Room } from '@/types/room';

// GET /api/rooms/[slug] — fetches a room from Redis by slug
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  try {
    const raw = await redis.get(`room:${slug}`);
    if (!raw) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Upstash may return already-parsed JSON or a string
    const room: Room = typeof raw === 'string' ? JSON.parse(raw) : (raw as Room);
    return NextResponse.json(room);
  } catch (err) {
    console.error('[GET /api/rooms/[slug]]', err);
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
  }
}
