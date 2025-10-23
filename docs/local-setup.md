## Local setup: Neon + Clerk + Drizzle

Follow these steps to configure environment variables, create the database schema, and run the app locally.

### 1) Required environment variables
Create a `.env.local` file in your project root with the following values.

```bash
# Neon Postgres connection string (from Neon dashboard)
# Make sure sslmode=require is present
DATABASE_URL="postgres://USER:PASSWORD@ep-xxx-yyy.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Clerk API Keys (from Clerk dashboard > API Keys)
# Publishable key is required on the client, so it must be NEXT_PUBLIC_
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Clerk webhook secret: Dashboard > Webhooks > Add endpoint
# Point to: https://your-domain/api/webhooks/clerk (or http://localhost:3000 during local dev)
CLERK_WEBHOOK_SECRET="whsec_..."
```

Tips:
- The `DATABASE_URL` should point to your Neon project. Ensure `sslmode=require`.
- The `NEXT_PUBLIC_` prefix is mandatory for keys used client-side.
- The webhook secret is separate from API keys and is used to verify Clerk events.

### 2) Install dependencies

```bash
npm install
```

### 3) Apply the database schema (Drizzle)
This project uses Drizzle ORM. You can push the schema using the included scripts.

```bash
# Generates/executes SQL based on your schema in db/schema.ts
npm run db:push

# Optional: open Drizzle Studio to inspect tables
npm run db:studio
```

If you get an auth/connection error, double check `DATABASE_URL` in `.env.local`.

### 4) Start the app locally

```bash
npm run dev
```

The app will start on `http://localhost:3000`.

- Sign up or sign in via Clerk.
- Clerk will send user events to the webhook endpoint when configured.
- The webhook will upsert users into the `users` table in Neon.

### 5) Configure the Clerk webhook (recommended)
In the Clerk Dashboard:
- Go to Webhooks and create a new endpoint.
- For local development, you can use a tunneling tool (e.g., `ngrok`) to expose your local server.
- Set the endpoint URL to `https://<your-tunnel>.ngrok.io/api/webhooks/clerk`.
- Select events: `user.created`, `user.updated`, `user.deleted`.
- Copy the signing secret into your `.env.local` as `CLERK_WEBHOOK_SECRET`.

### 6) Common issues
- Missing or invalid Clerk publishable key during build: set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
- `DATABASE_URL is not set`: ensure `.env.local` is present and correctly formed.
- Neon SSL errors: confirm `?sslmode=require` is included in `DATABASE_URL`.

### 7) References
- Neon + Clerk + Drizzle walkthrough: `https://neon.com/blog/nextjs-authentication-using-clerk-drizzle-orm-and-neon`
- Clerk docs: `https://clerk.com/docs`
- Drizzle ORM: `https://orm.drizzle.team/`
- Neon: `https://neon.tech/`