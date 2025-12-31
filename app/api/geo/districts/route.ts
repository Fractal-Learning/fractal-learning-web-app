import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { STATE_ABBR_TO_FIPS } from '@/lib/geo/state-fips';
import { getDistrictsByFips } from '@/lib/educationdata/directory';

const QuerySchema = z.object({ state: z.string().length(2) });

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    state: searchParams.get('state')?.toUpperCase(),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
  }

  const fips = STATE_ABBR_TO_FIPS[parsed.data.state];
  if (!fips) {
    return NextResponse.json({ error: 'Unknown state' }, { status: 400 });
  }

  const districts = await getDistrictsByFips(fips);
  return NextResponse.json({ districts });
}

