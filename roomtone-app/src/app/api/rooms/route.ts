import { NextRequest, NextResponse } from 'next/server';
import { redis, ROOM_TTL } from '@/lib/redis';
import type { Room } from '@/types/room';

// POST /api/rooms — persists a room in Redis and returns { slug }
export async function POST(req: NextRequest) {
  try {
    const room = (await req.json()) as Room;

    if (!room?.slug || !room?.title || !Array.isArray(room?.tracks)) {
      return NextResponse.json({ error: 'Invalid room payload' }, { status: 400 });
    }

    // Strip any proxy prefixes from previewUrls before persisting
    const toSave: Room = {
      ...room,
      tracks: room.tracks.map(t => {
        const raw = t.previewUrl.startsWith('/api/preview?url=')
          ? decodeURIComponent(t.previewUrl.replace('/api/preview?url=', ''))
          : t.previewUrl;
        return { ...t, previewUrl: raw };
      }),
    };

    await redis.set(`room:${room.slug}`, JSON.stringify(toSave), { ex: ROOM_TTL });

    return NextResponse.json({ slug: room.slug });
  } catch (err) {
    console.error('[POST /api/rooms]', err);
    return NextResponse.json({ error: 'Failed to save room' }, { status: 500 });
  }
}
