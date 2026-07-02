# Merchant Cash Advance CRM

> A production-inspired, multi-tenant CRM platform built with **NestJS**, **Domain-Driven Design (DDD)**, **Clean Architecture**, **RBAC**, and **event-driven architecture**.

This project demonstrates how I'd architect a production-grade SaaS backend for the Merchant Cash Advance (MCA) domain. It focuses on maintainability, scalability, and separation of concerns rather than reproducing proprietary business rules.

The original commercial implementation contains underwriting, commission, syndication, and funding logic that cannot be shared publicly. This repository replaces those rules with a generic **Lead → Application** workflow while preserving the same architectural approach.

---

## Features

- Multi-tenant SaaS architecture
- Role-Based Access Control (RBAC)
- Lead & Application lifecycle management
- Event-driven workflow engine
- Audit logging
- REST API with Swagger
- PostgreSQL + Prisma
- JWT Authentication
- Dockerized development
- Unit & End-to-End tests

---

## Tech Stack

### Backend

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Swagger
- Docker

### Frontend

- Next.js 14
- React
- TypeScript
- Tailwind CSS

### Engineering Practices

- Clean Architecture
- Domain-Driven Design (DDD)
- Repository Pattern
- Dependency Injection
- SOLID Principles
- Strategy Pattern
- Domain Events
- Multi-Tenant Architecture

---

## Architecture

```
Frontend (Next.js)
        │
        ▼
NestJS REST API
        │
        ▼
Application Layer
        │
        ▼
Domain Layer
        │
        ▼
Infrastructure
        │
 ┌──────┼──────────┐
 ▼      ▼          ▼
PostgreSQL     Prisma     Event Bus
```

The project follows **Clean Architecture**, ensuring business rules remain independent of frameworks and infrastructure.

---

## Why This Project Exists

Rather than building another CRUD application, I wanted to demonstrate backend engineering practices used in production systems:

- Multi-tenant data isolation
- Modular architecture
- Event-driven workflows
- Rich domain model
- Testable business logic
- Clear separation between domain and infrastructure

The business workflow has been simplified, but the architectural decisions remain representative of a production system.

---

# Engineering Decisions

These are the architectural choices I would expect to discuss during a design review.

### Clean Architecture

Each module is divided into:

- Domain
- Application
- Infrastructure
- Interface

This keeps business logic isolated from NestJS, Prisma, and HTTP concerns.

---

### Event-Driven Modules

Leads and Applications communicate using domain events instead of direct service calls.

Benefits:

- Loose coupling
- Independent evolution
- Easier testing
- Better scalability

---

### Multi-Tenant Isolation

Tenant isolation is enforced through three independent layers:

- JWT tenant claims
- AsyncLocalStorage request context
- Repository-level tenant filtering

This defense-in-depth approach reduces the risk of cross-tenant data leaks.

---

### Strategy Pattern

Workflow validation is implemented using the Strategy Pattern instead of large conditional blocks.

Each business rule becomes an independent strategy, making workflows easier to extend.

---

### Frontend Responsibility

The frontend intentionally contains no business logic.

It exists only to:

- Authenticate users
- Display data
- Call backend APIs

All validation and business rules remain on the server.

---

## Project Structure

```
merchant-cash-advance-crm/

backend/
    src/
    prisma/
    test/

frontend/
    src/

docker-compose.yml
```

---

## Running the Project

```bash
docker compose up --build

docker compose exec api npx prisma db seed
```

### Services

Backend API

```
http://localhost:3000/api/v1
```

Swagger

```
http://localhost:3000/docs
```

Frontend

```
http://localhost:3001
```

---

## Testing

```bash
npm test

npm run test:e2e

npm run test:cov
```

The domain layer is tested independently from HTTP, Prisma, and NestJS, allowing business rules to be validated without infrastructure dependencies.

---

## Trade-offs

To keep the project portfolio-focused, several production concerns were intentionally omitted:

- Proprietary underwriting logic
- Commission calculations
- Funding integrations
- Syndication engine
- External payment integrations

The architecture has been preserved so these capabilities could be introduced without changing the overall design.

---

## Future Improvements

- Redis caching
- Background job processing
- CQRS
- Event sourcing
- Distributed messaging
- Observability (OpenTelemetry)
- Horizontal scaling

---

## License

MIT
