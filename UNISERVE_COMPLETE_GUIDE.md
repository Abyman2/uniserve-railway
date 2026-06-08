# UniServe — Complete Setup & Live Demo Guide

> **Goal:** Get the full stack running locally so you can demo every feature end-to-end in one session.

---

## Architecture at a Glance

```
Frontend (React + Vite)          Backend (Spring Boot)         Database
  http://localhost:5173    →→→     http://localhost:8080    →→→  PostgreSQL
      /api/* (proxied)              REST API + JWT Auth           port 5432
```

The Vite dev server **proxies** every `/api` request to port 8080, so you never need to handle CORS manually in the browser.

---

## Prerequisites (install once)

| Tool | Version | Check |
|------|---------|-------|
| Java JDK | 17 or 21 | `java -version` |
| Maven | 3.9+ (or use `./mvnw`) | `mvn -version` |
| Node.js | 18+ | `node -version` |
| npm | 9+ | `npm -version` |
| PostgreSQL | 14+ | `psql --version` |

---

## Step 1 — Set Up the Database

Open a terminal and run:

```sql
-- Connect to Postgres as superuser
psql -U postgres

-- Create the database
CREATE DATABASE uniconnect_db;

-- If you want a dedicated user:
-- CREATE USER uniconnect WITH PASSWORD 'postgres';
-- GRANT ALL PRIVILEGES ON DATABASE uniconnect_db TO uniconnect;

\q
```

The default credentials in `application.yml` are:
- **host:** `localhost:5432`
- **database:** `uniconnect_db`
- **user:** `postgres`
- **password:** `postgres`

If yours differ, set environment variables before starting the backend:
```bash
export DB_URL=jdbc:postgresql://localhost:5432/uniconnect_db
export DB_USER=your_user
export DB_PASS=your_password
```

---

## Step 2 — Start the Backend

```bash
# Navigate to the Spring Boot project
cd uniserve_project/backend

# Start with Maven wrapper (downloads Maven if missing)
./mvnw spring-boot:run

# OR if Maven is installed globally:
mvn spring-boot:run
```

**What happens on first start:**
1. Flyway runs all `V1__` → `V6__` migrations, creating all tables.
2. `AdminSeeder` checks for `admin@uniconnect.com` — if not found, it creates the admin account automatically.
3. You'll see in the console: `Default administrator seeded: admin@uniconnect.com / admin123`

**Verify it's up:**
```
http://localhost:8080/swagger-ui.html   ← Full interactive API docs
http://localhost:8080/api/listings      ← Should return empty page JSON
```

---

## Step 3 — Start the Frontend

```bash
# Navigate to the frontend folder
cd uniserve_project/frontend

# Install dependencies (first time only)
npm install

# Start the dev server
npm run dev
```

Open your browser to: **http://localhost:5173**

---

## Step 4 — Complete Demo Flow

Follow these steps in order to see every feature working:

### 4.1 — Test Language & Theme
- On the portal chooser page, click the `አማ` button → all text switches to Amharic
- Click the moon/sun icon → dark/light mode toggles
- Switch back to English (`EN`) for the rest of the demo

### 4.2 — Admin Login
1. Click **"Administrator Portal"**
2. Login with: `admin@uniconnect.com` / `admin123`
3. You land on the **Admin Dashboard**
4. Sidebar shows: **Provider Apps** | **Publish News**
5. Click **"Publish News"**, write a test announcement, click Post
6. Navigate to the News page (`/news`) to confirm it's live

### 4.3 — Register a New Student (Customer)
1. Logout (top-right logout button)
2. From portal chooser, select **Student Portal → Browse as Customer**
3. You're taken to the Listings page (browsing is public)
4. Click **Login / Register** and register a new account (e.g. `student@test.com` / `password123`)
5. After registration, login — you land on the listings page as a Customer

### 4.4 — Browse and Book a Service
> The listings page will be empty until a provider creates one. Follow step 4.6 first, then come back here.
1. Browse the service cards — filter by category or campus
2. Click any listing card to open the detail modal
3. Click **"Book Now"** → confirmation message appears
4. Navigate to **Dashboard** → **My Bookings** to see the PENDING booking

### 4.5 — Apply to Become a Provider
1. Logged in as Customer, go to **Dashboard → Apply as Provider** tab
2. Fill in Skills (e.g. "Calculus tutoring, Python programming") and Portfolio links
3. Click **Submit Application**
4. Status shows: *"Your application is submitted and pending admin approval."*

### 4.6 — Admin Approves the Application
1. Logout, login as `admin@uniconnect.com` / `admin123`
2. Admin Dashboard → **Provider Apps** tab
3. You'll see the pending application — click the green ✓ button to **Approve**
4. The applicant's role is now upgraded to `SERVICE_PROVIDER` in the database

### 4.7 — Provider Creates a Listing
1. Logout, login as the newly approved provider student
2. The Navbar now shows a **portal toggle button** (Customer ↔ Provider)
3. Click it to switch to the **Provider** view
4. Go to **Dashboard → My Services** tab
5. Click **"Create New Service"** → fill out the form → click **Publish Service**
6. Your listing now appears on the public Listings page!

### 4.8 — Customer Books, Provider Completes
1. Login as a different student account (or the same customer)
2. Book the newly created service from the Listings page
3. Logout, login as the Provider, switch to Provider view
4. Dashboard → **Booking Requests** — see the PENDING request
5. Click **Accept** → status changes to ACCEPTED
6. Click **Complete** → status changes to COMPLETED

### 4.9 — Customer Leaves a Review
1. Login as the Customer who made the booking
2. Dashboard → **My Bookings** → find the COMPLETED booking
3. Click **"Write a Review"** → select stars, write a comment, Submit
4. Go to **Listings** page, click the provider's listing → reviews are displayed in the modal with average rating

---

## File Structure Reference

```
uniserve_project/
├── backend/                          ← Spring Boot
│   └── src/main/java/uniconnect_backend/
│       ├── auth/                     ← POST /api/auth/login, /register
│       ├── booking/                  ← GET/POST/PATCH /api/bookings/**
│       ├── config/
│       │   ├── AdminSeeder.java      ← Seeds admin@uniconnect.com on startup
│       │   └── CorsConfig.java       ← Allows http://localhost:5173
│       ├── listing/                  ← GET/POST/DELETE /api/listings/**
│       ├── news/                     ← GET/POST /api/news/**
│       ├── provider/                 ← GET/POST/PATCH /api/provider-applications/**
│       ├── review/                   ← GET/POST /api/reviews/**
│       ├── security/                 ← JWT filter, SecurityConfig
│       └── user/
│           ├── controller/UserController.java  ← GET /api/users/me
│           └── dto/UserResponse.java
│
└── frontend/                         ← React + Vite
    ├── vite.config.js                ← Proxies /api → localhost:8080
    └── src/
        ├── context/
        │   ├── AuthContext.jsx       ← login(), register(), logout(), refreshUser()
        │   ├── LanguageContext.jsx   ← t('key') translations EN/Amharic
        │   └── ThemeContext.jsx      ← Light/Dark mode toggle
        ├── components/
        │   └── Navbar.jsx            ← Responsive nav, portal switcher
        └── pages/
            ├── PortalChooser.jsx     ← Entry page: language + role selection
            ├── Login.jsx             ← Auth form
            ├── Register.jsx          ← Registration form
            ├── Listings.jsx          ← Public listings + search + booking modal
            ├── News.jsx              ← Public news feed
            ├── AboutUs.jsx           ← Static about page
            ├── CustomerDashboard.jsx ← Bookings, review, apply-as-provider
            ├── ProviderDashboard.jsx ← Create listings, manage bookings, reviews
            └── AdminDashboard.jsx    ← Provider applications, publish news
```

---

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Register new student |
| POST | `/api/auth/login` | None | Login → returns JWT |
| GET | `/api/users/me` | JWT | Get current user profile |
| GET | `/api/listings` | None | List services (paginated, filterable) |
| GET | `/api/listings/my` | JWT (Provider) | Provider's own listings |
| POST | `/api/listings` | JWT (Provider) | Create new listing |
| DELETE | `/api/listings/{id}` | JWT (Provider) | Deactivate listing |
| GET | `/api/bookings/customer` | JWT (Customer) | Customer's bookings |
| GET | `/api/bookings/provider` | JWT (Provider) | Provider's received bookings |
| POST | `/api/bookings` | JWT (Customer) | Request a booking |
| PATCH | `/api/bookings/{id}/cancel` | JWT (Customer) | Cancel booking |
| PATCH | `/api/bookings/{id}/accept` | JWT (Provider) | Accept booking |
| PATCH | `/api/bookings/{id}/reject` | JWT (Provider) | Reject booking |
| PATCH | `/api/bookings/{id}/complete` | JWT (Provider) | Mark complete |
| GET | `/api/reviews/provider/{id}` | None | Provider's public reviews |
| POST | `/api/reviews` | JWT (Customer) | Submit review for completed booking |
| GET | `/api/news` | None | List announcements (paginated) |
| POST | `/api/news` | JWT (Admin) | Post announcement |
| GET | `/api/provider-applications` | JWT (Admin) | All applications |
| POST | `/api/provider-applications` | JWT (Customer) | Submit provider application |
| PATCH | `/api/provider-applications/{id}/approve` | JWT (Admin) | Approve |
| PATCH | `/api/provider-applications/{id}/reject` | JWT (Admin) | Reject |

---

## Troubleshooting

### "CORS error" in browser console
- Make sure the backend is running on port **8080** (not another port)
- Make sure the frontend is running on port **5173** (Vite default)
- The `CorsConfig.java` explicitly allows `http://localhost:5173`

### "Failed to load listings" / "Could not connect to backend"
- Backend is not started yet — run `./mvnw spring-boot:run` first
- Backend crashed — check the terminal for a Java stack trace

### "Table not found" / "relation does not exist" (Postgres)
- Database `uniconnect_db` doesn't exist — run `CREATE DATABASE uniconnect_db;` in psql
- Wrong credentials — check `DB_URL`, `DB_USER`, `DB_PASS` env vars match your Postgres setup

### "Invalid credentials" on admin login
- The `AdminSeeder` only runs if `admin@uniconnect.com` doesn't exist yet
- If you already have a corrupted record, run: `DELETE FROM users WHERE email = 'admin@uniconnect.com';` then restart the backend

### Portal switcher not appearing for Service Provider
- The user must have `role = SERVICE_PROVIDER` in the database (set by admin approval)
- After approval, the user must **logout and login again** for the new JWT role to apply

### "You must be logged in as a Customer to book"
- You're browsing as a Provider — use the navbar toggle to switch back to Customer portal view

---

## Quick Restart Commands (copy-paste)

**Terminal 1 — Backend:**
```bash
cd path/to/uniserve_project/backend
./mvnw spring-boot:run
```

**Terminal 2 — Frontend:**
```bash
cd path/to/uniserve_project/frontend
npm run dev
```

**Browser:** http://localhost:5173

---

*UniServe v1.0 — Built with Spring Boot 3 + React 19 + PostgreSQL*
