# JEWELIA Backend (NestJS + Prisma)

Production-ready REST API for marketplace of jewelry shops with AR preview support.

## Quick start (local)

```bash
cd jewelia-api
cp .env.example .env
npm ci
npm run prisma:generate
npm run migrate:sql:init
docker compose up -d db redis
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jewelia?schema=public npx prisma migrate deploy
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jewelia?schema=public npm run prisma:seed
npm run start:dev
```

- Swagger docs: http://localhost:3000/docs
- Health: http://localhost:3000/health

## Core Endpoints

- Auth:
  - POST /auth/register
  - POST /auth/login
  - POST /auth/otp
  - POST /auth/refresh
  - POST /auth/logout
- Cities:
  - GET /v1/cities
  - GET /v1/cities/{slug}/shops
  - GET /v1/cities/{slug}/products
- Shops:
  - POST /v1/shops/register
  - GET /v1/shops/{id}
  - PUT /v1/shops/{id}
  - GET /v1/shops/me
- Products:
  - POST /v1/shops/{id}/products
  - GET /v1/products/{id}
- Leads:
  - POST /v1/products/{id}/lead
- Payments:
  - POST /v1/shops/{id}/membership/checkout
  - POST /v1/payments/webhook

## Curl examples

```bash
# Register
curl -sX POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"A","email":"a@a.com","phone":"9999999999","password":"Pass#123"}'

# Login
curl -sX POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"emailOrPhone":"a@a.com","password":"Pass#123"}'

# Cities
curl -s http://localhost:3000/v1/cities | jq
```

## Vercel Deployment

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-4729a1cd
```

After deploy:

```bash
curl https://agentic-4729a1cd.vercel.app/health
```

## Tests

```bash
npm test
```
