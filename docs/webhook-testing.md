# Testing Clerk Webhooks

This guide explains multiple ways to verify that your Clerk webhooks are working correctly.

## Quick Checklist

- ✅ Webhook endpoint is accessible
- ✅ `CLERK_WEBHOOK_SECRET` is set correctly
- ✅ Webhook is configured in Clerk Dashboard
- ✅ Events are being received and processed
- ✅ Database records are being created/updated

## Method 1: Check Application Logs

Your webhook handler includes console.log statements that will show webhook activity.

### Steps:

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Watch the console output** - You should see logs like:
   ```
   [Webhook] Received event: user.created
   [Webhook] Upserting user: user_xxx, email: user@example.com
   [Webhook] Successfully upserted user: user_xxx
   ```

3. **Trigger a webhook event** by:
   - Signing up a new user
   - Updating a user's profile in Clerk
   - Deleting a user in Clerk Dashboard

### What to Look For:

- ✅ **Success**: Logs show "Received event" and "Successfully upserted/deleted"
- ❌ **Error**: Logs show "Error processing" or "Invalid signature"
- ❌ **Missing**: No logs appear when you expect webhook events

## Method 2: Check Clerk Dashboard

The Clerk Dashboard provides webhook delivery status and logs.

### Steps:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Webhooks** in the sidebar
3. Click on your webhook endpoint
4. Check the **Recent deliveries** section

### What to Look For:

- ✅ **Success**: Green checkmarks with 200 status codes
- ❌ **Failed**: Red X marks with error status codes (400, 500, etc.)
- ⚠️ **Pending**: Webhooks that haven't been delivered yet

### Common Status Codes:

- `200` - Webhook processed successfully
- `400` - Bad request (missing headers, invalid signature)
- `500` - Server error (database issue, code error)
- `Timeout` - Webhook endpoint didn't respond in time

## Method 3: Verify Database Records

Check that webhook events are actually creating/updating database records.

### Using Drizzle Studio:

```bash
npm run db:studio
```

Then:
1. Open `http://localhost:4984` in your browser
2. Navigate to the `users` table
3. Check for:
   - New users after sign-up
   - Updated fields after profile changes
   - Deleted users (should be removed)

### Using SQL:

Connect to your database and run:

```sql
-- Check all users
SELECT * FROM users ORDER BY created_at DESC;

-- Check recent updates
SELECT id, email, first_name, last_name, updated_at 
FROM users 
ORDER BY updated_at DESC 
LIMIT 10;
```

## Method 4: Test Webhook Endpoint Directly

You can test the webhook endpoint manually using curl or a tool like Postman.

### Prerequisites:

- Your app must be running (`npm run dev`)
- For local testing, use a tunneling tool like `ngrok` to expose your local server

### Using ngrok:

1. **Install ngrok** (if not already installed):
   ```bash
   brew install ngrok  # macOS
   # or download from https://ngrok.com/download
   ```

2. **Start your Next.js app:**
   ```bash
   npm run dev
   ```

3. **Expose your local server:**
   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **Update Clerk webhook endpoint** to: `https://abc123.ngrok.io/api/webhooks/clerk`

### Test with Clerk's Webhook Testing Tool:

1. In Clerk Dashboard → Webhooks → Your endpoint
2. Click **"Send test event"**
3. Select an event type (`user.created`, `user.updated`, `user.deleted`)
4. Check your logs and database for the result

## Method 5: Add Enhanced Logging (Optional)

If you want more detailed logging, you can temporarily add more console.log statements to your webhook handler.

### Example Enhanced Logging:

```typescript
console.log(`[Webhook] Full event data:`, JSON.stringify(evt.data, null, 2));
console.log(`[Webhook] Database connection status:`, db ? 'Connected' : 'Not connected');
```

## Troubleshooting Common Issues

### Issue: "Missing svix headers" (400 error)

**Cause**: Webhook request doesn't include required Clerk headers.

**Solution**: 
- Ensure webhook is configured in Clerk Dashboard
- Verify the endpoint URL is correct
- Check that you're using the correct webhook secret

### Issue: "Invalid signature" (400 error)

**Cause**: `CLERK_WEBHOOK_SECRET` doesn't match the secret in Clerk Dashboard.

**Solution**:
1. Go to Clerk Dashboard → Webhooks → Your endpoint
2. Copy the **Signing Secret** (starts with `whsec_`)
3. Update `.env.local`:
   ```bash
   CLERK_WEBHOOK_SECRET="whsec_..."
   ```
4. Restart your dev server

### Issue: "Missing CLERK_WEBHOOK_SECRET" (500 error)

**Cause**: Environment variable is not set.

**Solution**:
- Check `.env.local` exists and contains `CLERK_WEBHOOK_SECRET`
- Restart your dev server after adding the variable
- Verify the variable name is exactly `CLERK_WEBHOOK_SECRET`

### Issue: No webhook events received

**Possible Causes**:
1. Webhook endpoint not configured in Clerk Dashboard
2. Local server not accessible (use ngrok for local testing)
3. Wrong endpoint URL in Clerk Dashboard
4. Webhook events not selected in Clerk Dashboard

**Solution**:
1. Verify webhook endpoint in Clerk Dashboard
2. Ensure events are selected: `user.created`, `user.updated`, `user.deleted`
3. For local testing, use ngrok or deploy to a public URL
4. Check that your endpoint URL ends with `/api/webhooks/clerk`

### Issue: Webhook received but database not updated

**Possible Causes**:
1. Database connection issue
2. Schema mismatch
3. Error in webhook handler code

**Solution**:
1. Check application logs for error messages
2. Verify `DATABASE_URL` is correct in `.env.local`
3. Test database connection: `npm run db:studio`
4. Check that schema matches: `npm run db:push`

## Quick Test Script

Here's a quick way to test if everything is set up:

1. **Start your app:**
   ```bash
   npm run dev
   ```

2. **Sign up a new user** through your app's sign-up page

3. **Check logs** - You should see:
   ```
   [Webhook] Received event: user.created
   [Webhook] Upserting user: user_xxx, email: ...
   [Webhook] Successfully upserted user: user_xxx
   ```

4. **Check database:**
   ```bash
   npm run db:studio
   ```
   Navigate to `users` table and verify the new user exists

5. **Check Clerk Dashboard** → Webhooks → Recent deliveries
   - Should show a successful delivery with 200 status

If all three checks pass, your webhooks are working! 🎉

