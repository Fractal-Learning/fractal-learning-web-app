# Fix: Skip Organization Setup After Login

This document explains how to prevent users from being prompted to create or select an organization after sign-in/sign-up.

## Problem

After users sign in or sign up, Clerk shows an organization setup screen even though organization creation is disabled. Users see an error: "Organization creation is not enabled for this user" but are stuck on that screen.

## Solution

### 1. Disable Organization Session Task in Clerk Dashboard (Required)

The `choose-organization` session task must be disabled in Clerk Dashboard:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Session Settings** (or **Settings** → **Session**)
3. Find the **Session Tasks** section
4. Locate the `choose-organization` task
5. **Disable** this task

This prevents Clerk from prompting users to select/create an organization after authentication.

### 2. Code Changes (Already Implemented)

The following code changes have been made to ensure users are redirected directly to the dashboard:

#### A. ClerkProvider Configuration (`app/layout.tsx`)
- Added `afterSignInUrl="/dashboard"` 
- Added `afterSignUpUrl="/dashboard"`

#### B. SignIn Component (`app/sign-in/[[...sign-in]]/page.tsx`)
- Added `afterSignInUrl="/dashboard"`
- Added `forceRedirectUrl="/dashboard"` to bypass any organization selection screens

#### C. SignUp Component (`app/sign-up/[[...sign-up]]/page.tsx`)
- Added `afterSignUpUrl="/dashboard"`
- Added `forceRedirectUrl="/dashboard"` to bypass any organization selection screens

#### D. Middleware (`middleware.ts`)
- Added redirect logic to catch any organization-related routes and redirect to dashboard

## Verification

After making the Clerk Dashboard change:

1. **Sign out** from your application
2. **Sign in** again
3. You should be redirected directly to `/dashboard` without seeing the organization setup screen

## Additional Notes

- The `forceRedirectUrl` prop forces Clerk to redirect to the specified URL even if there are pending session tasks
- Organization creation is already disabled in your Clerk Dashboard (as mentioned)
- The `choose-organization` session task is separate from organization creation permissions and must be disabled separately

## References

- [Clerk Session Tasks Documentation](https://clerk.com/docs)
- [Clerk Force Organizations Guide](https://clerk.com/docs/guides/force-organizations)

