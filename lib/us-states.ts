import { asc } from 'drizzle-orm';
import type { UsState } from '@/types/us-states';
import { usStates } from '@/db/schema';

type DbLike = {
  select: (fields: { code: unknown; name: unknown }) => {
    from: (table: unknown) => {
      orderBy: (clause: unknown) => Promise<UsState[]>;
    };
  };
};

export async function listUsStates(db: DbLike): Promise<UsState[]> {
  return await db
    .select({ code: usStates.code, name: usStates.name })
    .from(usStates)
    .orderBy(asc(usStates.name));
}

