# MCA Portfolio CRM

A production-style, multi-tenant SaaS CRM backend built to demonstrate
backend engineering practice: **Clean Architecture**, **Domain-Driven
Design**, **RBAC**, **row-level multi-tenancy**, and an **event-driven
workflow engine** — implemented in **NestJS** + **Prisma** + **PostgreSQL**.

> This is a simplified, portfolio edition of a real multi-tenant MCA
> (Merchant Cash Advance) origination platform. The proprietary
> underwriting/commission/syndication business logic has been removed and
> replaced with a generic **Lead → Application** workflow that showcases
> the same architectural patterns without exposing business IP. See
> [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#what-was-intentionally-left-out-vs-the-original-mca-platform)
> for exactly what was excluded and why.

---

## Highlights

- **Clean Architecture**: `domain → application → infrastructure → interface`
  layering per module, dependencies point inward only.
- **DDD tactical patterns**: Aggregate Roots, Entities, Value Objects,
  Domain Events, Repository interfaces (ports), Result objects.
- **Multi-tenancy**: row-level isolation via JWT claims + AsyncLocalStorage
  request context + explicit repository filtering (three independent
  layers of defense).
- **RBAC**: role + fine-grained permission model, enforced by composable
  guards (`@Roles`, `@RequirePermissions`).
- **Event-driven workflow**: Lead and Application bounded contexts
  communicate only via domain events (Observer pattern) — no direct
  module coupling.
- **Design patterns**: Strategy (workflow transition rules), Factory
  (application creation), Repository, Mapper/Anti-Corruption Layer,
  Decorator, Dependency Inversion. Full index in
  [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#design-patterns-used-index).
- **Production scaffolding**: Swagger/OpenAPI docs, multi-stage Docker
  build, docker-compose, structured error handling, request logging,
  rate limiting, Helmet, config validation, seed data, unit + e2e tests.

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | NestJS 10 |
| ORM | Prisma 5 (PostgreSQL) |
| Auth | JWT (access + rotating refresh tokens), Passport |
| Validation | class-validator / class-transformer |
| API docs | Swagger (`@nestjs/swagger`) |
| Events | `@nestjs/event-emitter` |
| Request context | `nestjs-cls` (AsyncLocalStorage) |
| Testing | Jest, Supertest |
| Containerization | Docker, docker-compose |

---

## Quick start (Docker — recommended)

```bash
cp .env.example .env
docker compose up --build
```

This starts Postgres, runs migrations, and boots the API on
**http://localhost:3000**.

- Swagger UI: **http://localhost:3000/docs**
- Health check: **http://localhost:3000/health**

Seed demo data (two isolated tenants, users, roles):

```bash
docker compose exec api npx prisma db seed
```

Seeded logins (password for all: `Password123!`):

| Tenant slug | Admin | ISO |
|---|---|---|
| `capital-partners` | admin@capital-partners.com | iso@capital-partners.com |
| `fundwise` | admin@fundwise.com | iso@fundwise.com |

---

## Quick start (local Node, Postgres in Docker)

```bash
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d   # Postgres only
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

---

## Try it end-to-end

```bash
# 1. Log in as an ISO user
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"tenantSlug":"capital-partners","email":"iso@capital-partners.com","password":"Password123!"}'
# -> { accessToken, refreshToken, user }

# 2. Create a lead (use the accessToken above)
curl -s -X POST http://localhost:3000/api/v1/leads \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"businessName":"Acme Bakery","contactName":"John Smith","email":"john@acme.com","phone":"555-0100"}'

# 3. Walk it through the pipeline
curl -s -X PATCH http://localhost:3000/api/v1/leads/<leadId>/status \
  -H "Authorization: Bearer <accessToken>" -H "Content-Type: application/json" \
  -d '{"status":"CONTACTED"}'
curl -s -X PATCH http://localhost:3000/api/v1/leads/<leadId>/status \
  -H "Authorization: Bearer <accessToken>" -H "Content-Type: application/json" \
  -d '{"status":"QUALIFIED"}'
curl -s -X PATCH http://localhost:3000/api/v1/leads/<leadId>/status \
  -H "Authorization: Bearer <accessToken>" -H "Content-Type: application/json" \
  -d '{"status":"CONVERTED"}'
# -> LeadConvertedEvent fires -> an Application is auto-created (DRAFT)

# 4. Log in as the underwriter and move the application through review
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"tenantSlug":"capital-partners","email":"underwriter@capital-partners.com","password":"Password123!"}'
```

Every write above is visible, per-tenant, at `GET /api/v1/audit-log`
(admin only) — populated automatically by the `AuditLogListener`, without
any use case writing to it directly.

---

## Testing

```bash
npm test              # domain unit tests (state machines, strategies) — no DB needed
npm run test:e2e       # HTTP-level tests against a real Postgres instance
npm run test:cov
```

The domain layer (`Lead`, `Application` aggregates) is tested with zero
mocking — no Prisma, no HTTP, no DI container — because it has no
dependency on any of them. See `test/unit/`.

---

## Project structure

```
src/
├── main.ts                     # bootstrap: Swagger, Helmet, versioning, validation
├── app.module.ts                # composition root, global guards/interceptors/filters
├── config/                      # env loading + Joi validation schema
├── common/constants/            # shared enums/constants (permission catalog)
├── shared/                      # cross-cutting kernel, imported by every module
│   ├── domain/                  # Entity, AggregateRoot, ValueObject, DomainEvent, Result
│   ├── context/                 # TenantContextService (AsyncLocalStorage)
│   ├── infrastructure/          # PrismaService, DomainEventBus
│   ├── guards/                  # JwtAuthGuard, RolesGuard, PermissionsGuard
│   ├── interceptors/            # TenantBindingInterceptor, LoggingInterceptor
│   ├── decorators/               # @Public, @Roles, @RequirePermissions, @CurrentUser
│   └── filters/                 # GlobalExceptionFilter
└── modules/
    ├── auth/                    # login, register, refresh-token rotation
    ├── tenants/                 # platform-level tenant provisioning
    ├── users/                   # tenant-scoped user administration
    ├── leads/                   # domain / application / infrastructure / dto
    ├── applications/            # domain / application / infrastructure / dto
    │   └── domain/strategies/    # Strategy pattern: per-transition business rules
    ├── audit-log/                # wildcard event listener + query endpoint
    └── health/                   # liveness/readiness probe

prisma/
├── schema.prisma                # multi-tenant data model
└── seed.ts                      # demo tenants/users/roles

docs/
└── ARCHITECTURE.md              # diagrams + design-pattern index

test/
├── unit/                        # domain aggregate tests (no I/O)
└── e2e/                         # HTTP-level smoke tests
```

Full diagrams (layering, multi-tenancy request flow, RBAC model,
event-driven sequence, workflow state machine) are in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## API reference

Full interactive OpenAPI docs are served at `/docs` once the app is
running. Every route is documented with `@ApiOperation` summaries,
request/response DTOs, and bearer-auth requirements.

| Module | Base path | Notes |
|---|---|---|
| Auth | `/api/v1/auth` | `POST /register`, `POST /login`, `POST /refresh` |
| Platform | `/api/v1/platform/tenants` | `POST /` — provision a tenant with default roles |
| Users | `/api/v1/users` | Tenant-scoped, admin-only |
| Leads | `/api/v1/leads` | CRUD + `PATCH /:id/status` |
| Applications | `/api/v1/applications` | Documents, transitions, underwriter decisioning |
| Audit Log | `/api/v1/audit-log` | Tenant-scoped, admin-only |
| Health | `/health` | Public, DB connectivity check |

---

## License

MIT — built as a portfolio/demonstration project.
