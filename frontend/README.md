# MCA Portfolio CRM — Frontend

Next.js 14 (App Router) client for the [NestJS backend](../backend). Thin,
API-driven UI — every authorization/business-rule decision is made by the
backend; this app only reflects state and offers the actions the current
user's role is likely to have.

## Stack

- Next.js 14 App Router, TypeScript, Tailwind CSS
- No external state library — React context (`AuthProvider`) + local
  component state is enough for this scope
- A single `api-client.ts` seam handles auth headers and transparent
  access-token refresh-on-401 for every request

## Structure

```
src/
├── app/
│   ├── (auth)/login, register        # public routes
│   ├── (dashboard)/leads, applications, audit-log   # protected routes, shared AppShell
│   └── layout.tsx, page.tsx
├── components/                        # AppShell, StatusBadge, ProtectedRoute
├── context/auth-context.tsx           # session state, login/logout, role checks
├── lib/                               # api-client, per-resource API modules, token storage
└── types/                             # shared TS types mirroring backend DTOs
```

## Run locally

```bash
cp .env.example .env       # NEXT_PUBLIC_API_URL, defaults to http://localhost:3000/api/v1
npm install
npm run dev
```

Requires the backend (see `../backend`) running and seeded
(`npx prisma db seed`) so the demo tenant/login shown on the login screen
works out of the box.

## Notes on scope

- Auth tokens are kept in `localStorage` for simplicity (clearly commented
  in `token-store.ts` as the seam to swap for httpOnly cookies in a real
  deployment).
- Document upload is simulated (a `storageKey` string is generated
  client-side) rather than wired to real pre-signed S3 uploads — the
  backend `documents` endpoint and schema are real; only the browser file
  picker / actual binary upload was left out as out-of-scope for a
  backend-focused portfolio piece.
- The UI's allowed lead/application transitions mirror the backend's state
  machines for a good UX, but the backend re-validates every transition
  independently — the frontend's copy of the rules is a convenience, not
  the source of truth.
