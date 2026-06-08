# UniConnect Backend

## Project Description

UniConnect is a university service marketplace platform that connects students with service providers. Users can browse listings, make bookings, submit reviews, apply to become service providers, and view campus news.

## Technologies Used

* Java 21
* Spring Boot 3.5
* Spring Security + JWT
* PostgreSQL + Flyway
* Maven
* Swagger/OpenAPI
* Docker Compose
* JUnit 5, Mockito, JaCoCo

## Group Members

* Abel Seleshe
* Baheran Tesfaye
* Nebiyu Yohannes
* Wondesen Teshale

## Prerequisites

* Java 21
* Maven 3.9+
* Docker (optional, for containerized run)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DB_URL` | JDBC URL (default: `jdbc:postgresql://localhost:5432/uniconnect_db`) |
| `DB_USER` | Database user (default: `postgres`) |
| `DB_PASS` | Database password |
| `JWT_SECRET` | JWT signing secret (min 32 characters) |

## Build Instructions

```bash
cd backend
mvn clean package -DskipTests
```

## Run Instructions (local)

```bash
cd backend
set JWT_SECRET=your-local-secret-at-least-32-characters-long
set DB_URL=jdbc:postgresql://localhost:5432/uniconnect_db
set DB_USER=postgres
set DB_PASS=your-db-password
mvn spring-boot:run
```

## Run Tests

```bash
cd backend
mvn test
```

JaCoCo report: `backend/target/site/jacoco/index.html`

## Docker Compose (from repository root)

```bash
set JWT_SECRET=your-local-secret-at-least-32-characters-long
docker-compose up --build
```

API: http://localhost:8080

## Swagger UI

http://localhost:8080/swagger-ui.html

## API Highlights

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/listings` | Public |
| GET | `/api/listings/{id}` | Public |
| GET | `/api/listings/my` | Provider |
| POST/PUT/DELETE | `/api/listings` | Provider |
| POST | `/api/bookings` | Customer |
| PATCH | `/api/bookings/{id}/accept\|reject\|complete` | Provider (owner) |
| PATCH | `/api/bookings/{id}/cancel` | Customer (owner) |
| GET | `/api/reviews/provider/{providerId}` | Public |
| POST | `/api/reviews` | Customer |
| POST | `/api/provider-applications` | Customer |
| GET/PATCH | `/api/provider-applications` | Admin |
| GET/POST | `/api/news` | GET public, POST admin |

## GitHub Repository

(Add your public repository URL before submission)

## Deployed URL

(Add your deployed application URL before submission)

## AI Usage Disclosure

This project used AI tools including ChatGPT and Cursor for guidance, debugging assistance, documentation generation, and architecture discussions. All generated content was reviewed, modified, and validated by the project team before inclusion.
