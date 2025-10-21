# Server Error Fix for HeartMail

## Current Issue
The server is throwing a "server-side exception" error with digest `2815215854`. This is likely caused by:

1. **Server-side rendering issues** with auth hooks
2. **Missing environment variables** in production
3. **Supabase connection problems** during SSR

## Solutions

### 1. Fix Server-Side Rendering Issues

The main issue is that we're using client-side hooks (`useAuthState`, `useAuth`) in a server component. Let's fix this:

#### Option A: Make Home Page Client-Side Only
```typescript
// app/page.tsx
'use client'

import dynamic from 'next/dynamic'
// ... rest of imports

export default function Home() {
  // Client-side only logic
}
```

#### Option B: Use Server-Side Auth Check
```typescript
// app/page.tsx
import { getServerUser } from '@/lib/server-auth'

export default async function Home() {
  const user = await getServerUser()
  
  return (
    <main>
      {/* Server-side rendered content */}
    </main>
  )
}
```

### 2. Environment Variables Check

Ensure these are set in production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`

### 3. Add Error Boundaries

Create error boundaries to catch and handle SSR errors gracefully.

### 4. Fix X-Frame-Options Issue

The current config has `X-Frame-Options: DENY` which blocks Stripe iframes. We need to allow Stripe domains.

## Immediate Fix

The quickest fix is to make the home page client-side only and add proper error handling.
