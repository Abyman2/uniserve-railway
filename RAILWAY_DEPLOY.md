# Deploy UniServe on Railway

Three services: **PostgreSQL**, **backend**, **frontend**.

## 1. Create Railway project

```bash
npm install -g @railway/cli
railway login
railway init
```

## 2. Add PostgreSQL

In the Railway dashboard: **+ New** → **Database** → **PostgreSQL**

Or CLI:

```bash
railway add --database postgres
```

## 3. Deploy backend

```bash
cd uniserve_project/backend
railway link          # select your project, create service "uniserve-backend"
railway service create uniserve-backend
railway variables set SPRING_PROFILES_ACTIVE=prod
railway variables set JWT_SECRET="your-random-secret-at-least-32-characters-long"
# Link Postgres: in dashboard, add DATABASE_URL reference from Postgres service to backend
railway up
```

Backend reads `DATABASE_URL` automatically (converted to JDBC). Set `CORS_ALLOWED_ORIGINS` after you have the frontend URL.

## 4. Deploy frontend

```bash
cd uniserve_project/frontend
railway service create uniserve-frontend
railway variables set VITE_API_BASE_URL="https://YOUR-BACKEND.up.railway.app"
railway up
```

`VITE_API_BASE_URL` is baked in at Docker build time.

## 5. Wire CORS (backend)

After frontend is live:

```bash
cd uniserve_project/backend
railway variables set CORS_ALLOWED_ORIGINS="https://YOUR-FRONTEND.up.railway.app"
```

Redeploy backend if needed.

## Environment variables

| Service | Variable | Required |
|---------|----------|----------|
| Backend | `JWT_SECRET` | Yes (32+ chars) |
| Backend | `DATABASE_URL` | Yes (from Postgres plugin) |
| Backend | `CORS_ALLOWED_ORIGINS` | Yes (frontend URL) |
| Frontend | `VITE_API_BASE_URL` | Yes (backend public URL) |

## Health check

Backend: `GET /api/listings` (configured in `railway.toml`)
