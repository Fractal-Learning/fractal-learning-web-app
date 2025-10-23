import { NextResponse } from "next/server";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const payload = await req.text();
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse("Missing svix headers", { status: 400 });
  }

  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new NextResponse("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
  }
  const wh = new Webhook(secret);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, image_url, first_name, last_name } = evt.data;
    const primaryEmail = email_addresses?.find((e) => e.id === evt.data.primary_email_address_id)?.email_address
      ?? email_addresses?.[0]?.email_address
      ?? "";

    if (!primaryEmail) {
      return NextResponse.json({ ok: true });
    }

    const db = getDb();
    await db
      .insert(users)
      .values({
        id,
        email: primaryEmail,
        firstName: first_name || null,
        lastName: last_name || null,
        imageUrl: image_url || null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: primaryEmail,
          firstName: first_name || null,
          lastName: last_name || null,
          imageUrl: image_url || null,
          updatedAt: new Date(),
        },
      });
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      const db = getDb();
      await db.delete(users).where(eq(users.id, id));
    }
  }

  return NextResponse.json({ ok: true });
}
