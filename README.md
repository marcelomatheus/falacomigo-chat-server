# falacomigo-chat-server

NestJS server for FalaComigo, a chat app focused on language practice with AI support (translation, suggestions, deep corrections).

## Overview
- REST API + WebSocket (Socket.IO) with JWT authentication.
- MongoDB via Prisma; Redis for queues (BullMQ) and Socket.IO adapter.
- Groq API integration for AI features.

## Architecture
<img width="800" alt="image" src="https://github.com/user-attachments/assets/36e441a8-f15e-4e67-b6a3-e3895e47e00f" />

## Directory layout
```
.
├─ docker-compose.yml / Dockerfile
├─ package.json
├─ prisma/
│  ├─ schema.prisma          # MongoDB schema (User, Profile, Chat, Message, DeepCorrections)
│  └─ prisma.config.ts
├─ scripts/
│  └─ create-missing-profiles.ts
├─ src/
│  ├─ main.ts                # Bootstrap, CORS, pipes, global filters, Swagger
│  ├─ app.module.ts          # Modules and global JWT guard
│  ├─ auth/                  # Login/register, JWT strategy, guards, DTOs
│  ├─ user/                  # Users
│  ├─ profile/               # Profiles and token balance
│  ├─ chat/                  # Rooms, messages, WS gateway
│  ├─ message/               # Message persistence and enrichment
│  ├─ deep-corrections/      # Detailed AI corrections
│  ├─ ai-tools/              # Helper tools (interpretation/suggestions)
│  ├─ groq/                  # Groq client (LLM)
│  ├─ socket-store/          # Socket/room management
│  ├─ prisma/                # PrismaModule, filters
│  └─ common/filters         # HttpExceptionFilter
└─ test/                     # e2e tests
```

## Modules and features
- App: orchestrates modules and registers JwtAuthGuard globally.
- Auth: login/register with JWT; bcrypt; creates profile if missing; tokens expire in 1 day.
- User/Profile: CRUD and token balance; learned/known languages.
- Chat: one-to-one or group rooms, messages, WebSocket gateway.
- Message: messages with translation and correction suggestions.
- Deep Corrections: detailed message corrections.
- AI Tools: interpretation and suggestion utilities for AI.
- Groq: integration with Groq API.
- Socket Store: Redis adapter for Socket.IO; connection management.
- Prisma: client and exception filters for DB errors.

## Authentication flow
1) Register: receives name, email, password, optional balance; creates user and profile in a Prisma transaction with default balance of 30 tokens.
2) Login: validates email/password with bcrypt; returns JWT `access_token` and basic user + profile data.
3) JWT: strategy reads bearer token, fetches user and profile; if profile does not exist, it is created automatically; injects `sub` (user id) and `profileId` into the payload.
4) Route protection: JwtAuthGuard is global; public endpoints use the `@Public()` decorator.

## Swagger
- Available at `/api` with Bearer authentication configured.
- Title: Fala Comigo, version 1.0.

## External dependencies
- MongoDB (DATABASE_URL in Mongo format, used by Prisma MongoDB provider).
- Redis (REDIS_HOST/PORT/PASSWORD or REDIS_URL) for BullMQ and the Socket.IO adapter.
- Groq API (GROQ_API_KEY) for AI features.
- Supabase: no active integration in the code; add credentials and module if you plan to use it.

## Key environment variables
- DATABASE_URL
- REDIS_HOST, REDIS_PORT (6379), REDIS_PASSWORD, REDIS_URL
- JWT_SECRET
- GROQ_API_KEY
- FRONTEND_URL (optional, defaults to http://localhost:3000 for CORS)
- PORT (defaults to 8080)

## Run locally
1) Prerequisites: Node 22+, npm, reachable MongoDB, reachable Redis, Groq API key.
2) Install deps: `npm install`.
3) Generate Prisma Client: `npm run prisma:generate`.
4) Start in dev: `npm run start:dev` (port 8080 by default).
5) Local production: `npm run build` and `npm run start:prod`.
6) Swagger: open http://localhost:8080/api.

## Docker
- Set `.env` with `DATABASE_URL`, `REDIS_HOST`, `REDIS_PASSWORD`, `REDIS_URL`, `JWT_SECRET`, `GROQ_API_KEY`.
- Redis is started with append-only enabled (`--appendonly yes`) and password protection (`--requirepass`).
- Redis persists data in `./data`.
- The app service runs with `NODE_ENV=production`, `PORT=8080`, and `command: ["npm", "start"]`.
- Run manually: `docker compose up -d --build`.
- Traefik labels are configured for host `server.falacomigo.space`, entrypoint `websecure`, and certresolver `myresolver`.
- The compose file expects an external Docker network named `proxy-public`.

## CI/CD deployment (GitHub Actions)
- Workflow file: `.github/workflows/deploy.yml`.
- Trigger: every push to `main`.
- Runner: `ubuntu-latest`.
- Steps:
  1) Checks out the repository.
  2) Configures SSH key and `known_hosts`.
  3) Connects to the server via SSH and runs:
     - `cd /var/www/app`
     - `git pull`
     - `docker compose up -d --build`

Required repository secrets:
- `SSH_HOST`
- `SSH_PORT`
- `SSH_USER`
- `SSH_PRIVATE_KEY`

## Useful scripts
- `npm run prisma:generate` — generate Prisma client.
- `npm run prisma:push` — apply schema to DB.
- `npm run prisma:studio` — open Prisma Studio.
- `npm run lint` / `npm run format` — code quality.
- `npm test` / `npm run test:cov` — tests.

## Tests
- Unit: `npm test`
- Coverage: `npm run test:cov`

