# TaskFlow Backend

A lightweight project management system backend built with Node.js, TypeScript, Express, PostgreSQL, Prisma, Redis, and BullMQ.

## 📋 Project Overview

TaskFlow is a multi-tenant project management system where:
- Users belong to organizations
- Organizations have members with role-based access control (RBAC)
- Users can create and manage projects within their organization
- Projects contain tasks that can be assigned to organization members
- Task assignments trigger asynchronous email notifications
- Complete security isolation between organizations (cross-tenant protection)

## 🏗️ Architecture

```
Client
  ↓
Express API (REST)
  ↓
PostgreSQL (via Prisma ORM)
  ↓
Redis/BullMQ (Job Queue)
  ↓
Worker Process
  ↓
Email Notifications (Mock)
```

### Key Components

- **API Server**: Handles HTTP requests, authentication, authorization, and business logic
- **Worker Process**: Processes background jobs asynchronously
- **PostgreSQL**: Primary database for all application data
- **Redis**: Message broker for BullMQ job queue
- **Outbox Dispatcher**: Ensures reliable job enqueueing using transactional outbox pattern

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **TypeScript** | Type-safe development |
| **Express.js** | Web framework |
| **PostgreSQL** | Relational database |
| **Prisma** | ORM and database migrations |
| **Redis** | Job queue backend |
| **BullMQ** | Background job processing |
| **JWT** | Authentication tokens |
| **bcrypt** | Password hashing (cost factor 12) |
| **Zod** | Request validation |
| **Winston** | Logging |
| **Swagger** | API documentation |
| **Jest** | Testing framework |
| **Docker** | Containerization |

## 📁 Folder Structure

```
taskflow-backend/
├── prisma/
│   └── schema.prisma           # Database schema
├── src/
│   ├── config/                 # Configuration files
│   │   ├── env.ts             # Environment variables
│   │   ├── logger.ts          # Winston logger setup
│   │   ├── redis.ts           # Redis connection
│   │   └── swagger.ts         # Swagger configuration
│   ├── database/
│   │   ├── prisma.ts          # Prisma client
│   │   └── seed.ts            # Database seed script
│   ├── middleware/             # Express middleware
│   │   ├── authenticate.ts    # JWT authentication
│   │   ├── authorize.ts       # Organization-level authorization
│   │   ├── errorHandler.ts   # Centralized error handling
│   │   ├── rateLimit.ts       # Rate limiting
│   │   └── validate.ts        # Request validation
│   ├── modules/                # Feature modules
│   │   ├── auth/              # Authentication
│   │   ├── projects/          # Project management
│   │   ├── tasks/             # Task management
│   │   ├── assignments/       # Task assignments
│   │   ├── dashboard/         # Dashboard stats
│   │   └── jobs/              # Job status API
│   ├── queues/
│   │   └── email.queue.ts     # BullMQ queue configuration
│   ├── services/
│   │   └── outbox.dispatcher.ts # Transactional outbox dispatcher
│   ├── workers/
│   │   └── email.worker.ts    # Background job worker
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Utility functions
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
├── docker-compose.yml          # Docker orchestration
├── Dockerfile                  # Container image
└── package.json                # Dependencies and scripts
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Docker & Docker Compose (for containerized setup)

### Local Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd taskflow-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and configure:
```env
DATABASE_URL=postgresql://taskflow_user:taskflow_password@localhost:5432/taskflow_db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_ACCESS_SECRET=<generate-a-secure-random-string-min-32-chars>
JWT_REFRESH_SECRET=<generate-a-different-secure-random-string-min-32-chars>
```

4. **Start PostgreSQL and Redis**
```bash
# Using Docker:
docker run --name taskflow-postgres -e POSTGRES_USER=taskflow_user -e POSTGRES_PASSWORD=taskflow_password -e POSTGRES_DB=taskflow_db -p 5432:5432 -d postgres:16-alpine
docker run --name taskflow-redis -p 6379:6379 -d redis:7-alpine
```

5. **Run database migrations**
```bash
npm run db:migrate
```

6. **Seed the database**
```bash
npm run db:seed
```

7. **Start the API server**
```bash
npm run dev
```

8. **Start the worker (in a separate terminal)**
```bash
npm run worker
```

The API will be available at `http://localhost:3000`

### Docker Setup

The easiest way to run the entire system:

```bash
docker compose up --build
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- API server on port 3000
- Worker process

**Note**: The API container automatically runs migrations on startup.

To seed the database after starting:
```bash
docker compose exec api npx tsx src/database/seed.ts
```

## 📚 API Documentation

### Swagger UI

Access interactive API documentation at:
```
http://localhost:3000/api-docs
```

### Authentication Flow

1. **Register**: `POST /auth/register`
2. **Login**: `POST /auth/login` → Returns `accessToken` and `refreshToken`
3. **Use Access Token**: Include in `Authorization: Bearer <token>` header
4. **Refresh Token**: `POST /auth/refresh` with `refreshToken`
5. **Logout**: `POST /auth/logout` with `refreshToken`

### Organization Context

Most endpoints require the `x-organization-id` header to specify which organization context to operate in.

Example:
```bash
curl -H "Authorization: Bearer <token>" \
     -H "x-organization-id: <org-id>" \
     http://localhost:3000/projects
```

## 🔐 Seed Credentials

After seeding, use these credentials for testing:

### Organization 1 (Acme Corporation)
- **Admin**: `john.admin@acme.com` / `password123`
- **Member**: `jane.doe@acme.com` / `password123`
- **Member**: `bob.smith@acme.com` / `password123`

### Organization 2 (TechStart Inc)
- **Admin**: `alice.admin@techstart.com` / `password123`
- **Member**: `charlie.dev@techstart.com` / `password123`

**Note**: These are development credentials only. Never use these in production.

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run with coverage
```bash
npm run test:coverage
```

### Test structure
- **Unit tests**: Located in `src/utils/__tests__/`
- **Integration tests**: Located in `src/__tests__/`

Key test coverage:
- Authentication flow
- Password hashing and verification
- JWT token generation and validation
- Pagination logic
- Cross-tenant access protection (critical security test)
- Task CRUD operations

## 🔒 Security Features

### Authentication
- **Password Hashing**: bcrypt with cost factor 12
- **JWT Access Tokens**: 15-minute expiry
- **JWT Refresh Tokens**: 7-day expiry, stored in database with revocation support
- **Rate Limiting**: 10 requests/minute on auth endpoints

### Authorization
- **Role-Based Access Control (RBAC)**: `org_admin` and `member` roles
- **Organization-Level Permissions**: Admin-only operations (e.g., project deletion)
- **Tenant Isolation**: All queries are organization-scoped

### Cross-Tenant Protection

The system enforces strict multi-tenant isolation:

1. **Organization Context**: Derived from authenticated user membership, NOT from client input
2. **Scoped Queries**: Every database query filters by organization
3. **Resource Validation**: All resource access verifies organization ownership
4. **Assignment Validation**: Users can only be assigned to tasks within their organization

Example protection:
```
User A (Org A) attempts to access Task belonging to Org B
→ Returns 404 (not 403 to avoid information disclosure)
```

## 🔄 Background Jobs & Consistency

### Transactional Outbox Pattern

TaskFlow uses the **transactional outbox pattern** to ensure consistency between task assignments and email notifications:

1. **Assignment Creation**: Task assignment and outbox event are created in a single database transaction
2. **Outbox Dispatcher**: Polls for undispatched events every 5 seconds
3. **Job Enqueueing**: Dispatches events to BullMQ and marks them as dispatched
4. **Worker Processing**: BullMQ worker processes email notifications asynchronously

**Why This Matters:**

Without this pattern:
```
✅ Task assignment saved to database
❌ Redis/BullMQ crashes before job is enqueued
→ Notification is lost forever
```

With transactional outbox:
```
✅ Task assignment + outbox event saved atomically
❌ Redis/BullMQ crashes
→ Outbox dispatcher retries enqueueing the event
→ Notification is eventually delivered
```

### Retry Strategy

- **Attempts**: 3 retries
- **Backoff**: Exponential (1s, 2s, 4s)
- **Dead Letter Queue**: Failed jobs after all retries are marked as `failed` status

### Job Status API

Track job status:
```
GET /jobs/:id
```

Returns:
- Job ID
- Status: `pending`, `active`, `completed`, `failed`
- Attempts
- Created/Updated/Completed timestamps

## 📊 API Collections

A Postman collection is included for testing:

**Import**: `taskflow-postman-collection.json`

The collection includes:
- Authentication endpoints
- Project CRUD
- Task CRUD with filters
- Task assignments
- Dashboard stats
- Job status checks

Environment variables:
- `base_url`: `http://localhost:3000`
- `access_token`: Auto-captured from login
- `org_id`: Set manually after login

## 🐳 Docker Commands

```bash
# Start all services
docker compose up

# Start in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Rebuild images
docker compose up --build

# Run migrations
docker compose exec api npx prisma migrate deploy

# Seed database
docker compose exec api npx tsx src/database/seed.ts

# Access API shell
docker compose exec api sh

# Access PostgreSQL
docker compose exec postgres psql -U taskflow_user -d taskflow_db
```

## 📈 Database Schema

### Core Entities

- **User**: User accounts with hashed passwords
- **Organization**: Tenant entities
- **OrgMember**: User-organization membership with roles
- **Project**: Projects owned by organizations
- **Task**: Tasks within projects
- **TaskAssignment**: User assignments to tasks
- **Comment**: Task comments
- **RefreshToken**: JWT refresh token storage
- **OutboxEvent**: Transactional outbox for reliable job enqueueing
- **BackgroundJob**: Job status tracking

### Key Relationships

```
Organization
  ├── OrgMember (many) → User
  └── Project (many)
        └── Task (many)
              ├── TaskAssignment (many) → User
              └── Comment (many) → User
```

### Soft Delete

Projects and tasks support soft deletion via `deleted_at` timestamp. Soft-deleted records are automatically excluded from queries.

## 🎯 Assignment Requirements Coverage

| Requirement | Implementation | Location |
|-------------|----------------|----------|
| User authentication | JWT with bcrypt (cost 12) | `src/modules/auth/` |
| Refresh tokens | Stored in DB with revocation | `src/modules/auth/auth.service.ts` |
| Rate limiting | 10 req/min on auth endpoints | `src/middleware/rateLimit.ts` |
| RBAC | org_admin / member roles | `@prisma/client`, `src/middleware/authorize.ts` |
| Cross-tenant isolation | Organization-scoped queries | All service layers |
| Projects CRUD | Full REST API | `src/modules/projects/` |
| Tasks CRUD | Full REST API with filters | `src/modules/tasks/` |
| Task filtering | Status, priority, assignee, date | `src/modules/tasks/task.service.ts` |
| Pagination | Offset-based, validated | `src/utils/pagination.ts` |
| Task assignment | With org validation | `src/modules/assignments/` |
| Background jobs | BullMQ with Redis | `src/workers/email.worker.ts` |
| Job consistency | Transactional outbox pattern | `src/services/outbox.dispatcher.ts` |
| Retry/backoff | 3 attempts, exponential | `src/queues/email.queue.ts` |
| Dead letter queue | Failed jobs marked & queryable | `src/workers/email.worker.ts` |
| Job status API | GET /jobs/:id | `src/modules/jobs/` |
| Dashboard | Task counts by status | `src/modules/dashboard/` |
| Tests | Unit + integration + security | `src/__tests__/`, `src/utils/__tests__/` |
| Swagger | Full API documentation | `http://localhost:3000/api-docs` |
| Docker | Complete orchestration | `docker-compose.yml` |
| Database migrations | Prisma migrations | `prisma/schema.prisma` |
| Seed data | 2 orgs, 5 users, 11 tasks | `src/database/seed.ts` |

## ⚠️ Known Limitations

1. **Email Sending**: Uses mock implementation. Production would integrate with SendGrid, AWS SES, or similar.
2. **File Uploads**: Not implemented (not required by assignment).
3. **Real-time Updates**: Not implemented (would require WebSocket for live notifications).
4. **Advanced Search**: Basic filtering only; no full-text search implemented.

## 🤝 Contributing

This is an assignment project. For production use, consider:
- Implementing real email service
- Adding comprehensive monitoring (Datadog, New Relic, etc.)
- Setting up CI/CD pipelines
- Adding end-to-end tests with Playwright or Cypress
- Implementing proper secret management (AWS Secrets Manager, Vault)
- Adding database connection pooling optimization
- Implementing request tracing (OpenTelemetry)

## 📝 License

MIT

## 👨‍💻 Development Notes

### Environment Variables

All environment variables are validated at startup using Zod. Missing or invalid values will prevent the application from starting with clear error messages.

### Database Indexes

Strategic indexes are placed on:
- Foreign keys
- Frequently queried columns (status, priority, due dates)
- Organization membership lookups
- Soft delete filtering

### Error Handling

All errors flow through a centralized error handler. Application errors extend `AppError` with:
- HTTP status code
- Error code (for client-side handling)
- Optional details (validation errors, etc.)

Stack traces are only exposed in development mode.

### Logging

Winston logger is used throughout with appropriate log levels:
- **debug**: Detailed debugging information
- **info**: General informational messages
- **warn**: Warning messages
- **error**: Error messages with stack traces

---

Built with ❤️ for the TaskFlow Backend Technical Assignment
