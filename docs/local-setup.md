## Local setup: Neon + Clerk + Drizzle

Follow these steps to configure environment variables, create the database schema, and run the app locally.

### 1) Start Local PostgreSQL Database (Docker)

For local development, you can use a Docker-based PostgreSQL database:

```bash
# Start the local PostgreSQL database
npm run db:up

# Check database status
docker compose ps

# View database logs
npm run db:logs

# Stop the database
npm run db:down

# Reset the database (removes all data)
npm run db:reset
```

The database will be available at `localhost:5432` with:
- **User**: `fractal_user`
- **Password**: `fractal_password`
- **Database**: `fractal_db`

### 2) Required environment variables
Create a `.env.local` file in your project root with the following values.

```bash
# For LOCAL development (Docker PostgreSQL):
DATABASE_URL="postgres://fractal_user:fractal_password@localhost:5432/fractal_db"

# For REMOTE/Production (Neon Postgres):
# DATABASE_URL="postgres://USER:PASSWORD@ep-xxx-yyy.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Clerk API Keys (from Clerk dashboard > API Keys)
# Publishable key is required on the client, so it must be NEXT_PUBLIC_
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Clerk webhook secret: Dashboard > Webhooks > Add endpoint
# Point to: https://your-domain/api/webhooks/clerk (or http://localhost:3000 during local dev)
CLERK_WEBHOOK_SECRET="whsec_..."
```

Tips:
- For local development, use the Docker PostgreSQL connection string (no SSL required).
- For production/remote, use your Neon project URL with `sslmode=require`.
- The `NEXT_PUBLIC_` prefix is mandatory for keys used client-side.
- The webhook secret is separate from API keys and is used to verify Clerk events.

### 3) Install dependencies

```bash
npm install
```

### 4) Apply the database schema (Drizzle)
This project uses Drizzle ORM. You can push the schema using the included scripts.

```bash
# Generates/executes SQL based on your schema in db/schema.ts
npm run db:push

# Optional: open Drizzle Studio to inspect tables
npm run db:studio
```

If you get an auth/connection error, double check `DATABASE_URL` in `.env.local`.

### 5) Start the app locally

```bash
npm run dev
```

The app will start on `http://localhost:3000`.

- Sign up or sign in via Clerk.
- Clerk will send user events to the webhook endpoint when configured.
- The webhook will upsert users into the `users` table in Neon.

### 6) Configure the Clerk webhook (recommended)
In the Clerk Dashboard:
- Go to Webhooks and create a new endpoint.
- For local development, you can use a tunneling tool (e.g., `ngrok`) to expose your local server.
- Set the endpoint URL to `https://<your-tunnel>.ngrok.io/api/webhooks/clerk`.
- Select events: `user.created`, `user.updated`, `user.deleted`.
- Copy the signing secret into your `.env.local` as `CLERK_WEBHOOK_SECRET`.

### 7) Common issues
- Missing or invalid Clerk publishable key during build: set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
- `DATABASE_URL is not set`: ensure `.env.local` is present and correctly formed.
- **Local database connection errors**: Make sure Docker is running and the database is started with `npm run db:up`. Check status with `docker compose ps`.
- **Port 5432 already in use**: Stop any existing PostgreSQL instances or modify the port in `docker-compose.yml`.
- **Neon SSL errors** (remote only): confirm `?sslmode=require` is included in `DATABASE_URL` for remote Neon connections.

### 8) References
- Neon + Clerk + Drizzle walkthrough: `https://neon.com/blog/nextjs-authentication-using-clerk-drizzle-orm-and-neon`
- Clerk docs: `https://clerk.com/docs`
- Drizzle ORM: `https://orm.drizzle.team/`
- Neon: `https://neon.tech/`