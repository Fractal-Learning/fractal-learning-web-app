import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { getDb } from '@/lib/db';
import { users, usersPii, organizations } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const payload = await req.text();
  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse('Missing svix headers', { status: 400 });
  }

  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new NextResponse('Missing CLERK_WEBHOOK_SECRET', { status: 500 });
  }
  const wh = new Webhook(secret);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    return new NextResponse('Invalid signature', { status: 400 });
  }

  const eventType = evt.type;
  console.log(`[Webhook] Received event: ${eventType}`);

  try {
    const db = getDb();

    // Handle User Events
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, image_url, first_name, last_name } =
        evt.data;
      const primaryEmail =
        email_addresses?.find((e) => e.id === evt.data.primary_email_address_id)
          ?.email_address ??
        email_addresses?.[0]?.email_address ??
        '';

      if (!primaryEmail) {
        console.log(`[Webhook] No primary email found for user ${id}`);
        return NextResponse.json({ ok: true, message: 'No primary email' });
      }

      console.log(`[Webhook] Upserting user: ${id}, email: ${primaryEmail}`);

      // 1. Upsert Base User (Identity)
      await db
        .insert(users)
        .values({
          id,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            updatedAt: new Date(),
          },
        });

      // 2. Upsert User PII
      await db
        .insert(usersPii)
        .values({
          userId: id,
          email: primaryEmail,
          firstName: first_name || null,
          lastName: last_name || null,
          imageUrl: image_url || null,
        })
        .onConflictDoUpdate({
          target: usersPii.userId,
          set: {
            email: primaryEmail,
            firstName: first_name || null,
            lastName: last_name || null,
            imageUrl: image_url || null,
          },
        });

      console.log(`[Webhook] Successfully upserted user: ${id}`);
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;
      if (id) {
        console.log(`[Webhook] Deleting user: ${id}`);
        // Cascade delete will handle usersPii and teacherProfiles
        await db.delete(users).where(eq(users.id, id));
        console.log(`[Webhook] Successfully deleted user: ${id}`);
      }
    }

    // Handle Organization Events
    if (
      eventType === 'organization.created' ||
      eventType === 'organization.updated'
    ) {
      const { id, name, slug, public_metadata } = evt.data;

      // Extract type and parent_id from metadata if available, otherwise default
      // Safe casting since we don't strictly verify metadata shape at runtime here
      const metadata = public_metadata as Record<string, any>;
      const type =
        metadata?.type === 'district' || metadata?.type === 'school'
          ? metadata.type
          : 'personal';
      const parentId = metadata?.parent_id || null;

      console.log(`[Webhook] Upserting organization: ${id}, type: ${type}`);

      await db
        .insert(organizations)
        .values({
          id,
          name,
          slug: slug || null, // slug can be null in some updates
          type,
          parentId,
        })
        .onConflictDoUpdate({
          target: organizations.id,
          set: {
            name,
            slug: slug || null,
            type,
            parentId,
            updatedAt: new Date(),
          },
        });

      console.log(`[Webhook] Successfully upserted organization: ${id}`);
    }

    if (eventType === 'organization.deleted') {
      const { id } = evt.data;
      if (id) {
        console.log(`[Webhook] Deleting organization: ${id}`);
        await db.delete(organizations).where(eq(organizations.id, id));
        console.log(`[Webhook] Successfully deleted organization: ${id}`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`[Webhook] Error processing ${eventType}:`, error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
