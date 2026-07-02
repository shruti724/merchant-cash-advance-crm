# MCA Portfolio CRM

A production-style, multi-tenant SaaS CRM — full stack — built to
demonstrate backend and frontend engineering practice: **Clean
Architecture**, **Domain-Driven Design**, **RBAC**, **row-level
multi-tenancy**, and an **event-driven workflow engine** on the backend,
with a thin, typed **Next.js** client on the frontend.

```
mca-portfolio-crm/
├── backend/    NestJS + Prisma + PostgreSQL API — see backend/README.md
├── frontend/   Next.js 14 (App Router) client   — see frontend/README.md
└── docker-compose.yml   one-command full-stack run
```

> This is a simplified, portfolio edition of a real multi-tenant MCA
> (Merchant Cash Advance) origination platform. The proprietary
> underwriting/commission/syndication business logic has been removed and
> replaced with a generic **Lead → Application** workflow that showcases
> the same architectural patterns without exposing business IP. See
> [`backend/docs/ARCHITECTURE.md`](backend/docs/ARCHITECTURE.md#what-was-intentionally-left-out-vs-the-original-mca-platform)
> for exactly what was excluded and why.

---

## Quick start (Docker — full stack, recommended)

```bash
docker compose up --build
```

- API: **http://localhost:3000/api/v1** · Swagger: **http://localhost:3000/docs**
- Frontend: **http://localhost:3001**

Seed demo data (two isolated tenants, users, roles):

```bash
docker compose exec api npx prisma db seed
```

Then open **http://localhost:3001/login** — seeded logins (password
`Password123!` for all):

| Tenant slug | Admin | ISO | Underwriter |
|---|---|---|---|
| `capital-partners` | admin@capital-partners.com | iso@capital-partners.com | underwriter@capital-partners.com |
| `fundwise` | admin@fundwise.com | iso@fundwise.com | underwriter@fundwise.com |

Walk the demo: log in as the **ISO**, create a lead, push it through
`CONTACTED → QUALIFIED → CONVERTED` — an Application is auto-created via a
domain event. Log in as the **underwriter**, attach a document, submit for
review, and approve/decline it. Log in as **admin** to view the full audit
trail at `/audit-log`.

---

## Run backend and frontend independently

Each half is a standalone project with its own README, dependencies, and
Docker build — useful if you only want to run/inspect one side, or point
the frontend at a differently-hosted API.

```bash
# Backend
cd backend && cp .env.example .env
docker compose -f docker-compose.dev.yml up -d   # Postgres only
npm install && npx prisma migrate dev && npx prisma db seed
npm run start:dev                                 # http://localhost:3000

# Frontend (separate terminal)
cd frontend && cp .env.example .env
npm install
npm run dev                                        # http://localhost:3001
```

See [`backend/README.md`](backend/README.md) and
[`frontend/README.md`](frontend/README.md) for full details, testing
instructions, and API reference.

---

## Why split this way

The backend is the substantive engineering demonstration — Clean
Architecture, DDD aggregates, the Strategy-pattern workflow engine,
event-driven module boundaries, multi-tenant isolation (see
[`backend/docs/ARCHITECTURE.md`](backend/docs/ARCHITECTURE.md) for
diagrams). The frontend is deliberately thin: it's a typed API client with
just enough UI to exercise every backend capability end-to-end (auth, the
lead pipeline, the application workflow, the audit trail) — it holds no
business rules of its own, and re-validates nothing the backend already
guards. That boundary is itself the point: swap the frontend for a mobile
app or another team's SPA and the backend doesn't change.

## License

MIT — built as a portfolio/demonstration project.
