import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSchoolsByLeaid } from '@/lib/educationdata/directory';

const QuerySchema = z.object({ leaid: z.string().min(3).max(20) });

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const parsed = QuerySchema.safeParse({ leaid: searchParams.get('leaid') });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid leaid' }, { status: 400 });
  }

  const schools = await getSchoolsByLeaid(parsed.data.leaid);
  return NextResponse.json({ schools });
}

