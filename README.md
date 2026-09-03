# Checa Antes

![Languages used](https://img.shields.io/github/languages/count/isadfrn/checaantes?style=flat-square)
![Repository size](https://img.shields.io/github/repo-size/isadfrn/checaantes?style=flat-square)
![Last commit](https://img.shields.io/github/last-commit/isadfrn/checaantes?style=flat-square)

## About

**Checa Antes** API: a backend for a catalog of regulated professions (federal and regional councils) and JWT authentication.

Profession reads are public. Create, update, and delete require a JWT with the `admin` role.

The `ViolationCategory` entity and Redis in Docker Compose already exist in the repo, but they are not exposed by the API or used by the app yet.

## Technologies

- Node 24.20.0 (`.nvmrc`) and npm workspaces
- NestJS 12, TypeORM, PostgreSQL 16
- JWT (`@nestjs/jwt`) and bcryptjs
- Vitest, oxlint, Prettier
- Docker Compose (Postgres and Redis)

## Requirements

- Node `24.20.0` (nvm recommended)
- Docker and Docker Compose
- npm

## Installation and Setup

From the repository root:

```bash
nvm use
npm install
docker compose up -d
```

Compose starts Postgres (`checaantes-db`, port `5432`) and Redis (port `6379`).

Copy [`apps/backend/.env.example`](apps/backend/.env.example) to `apps/backend/.env` and set:

- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`
- `JWT_SECRET`, `JWT_EXPIRES_IN` (e.g. `1d`)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` (used by the seed)

In the backend:

```bash
cd apps/backend
npm run migration:run
npm run seed
npm run start:dev
```

The API listens on `http://localhost:3000`.

Useful scripts in `apps/backend`:

| Script | Purpose |
| --- | --- |
| `npm run start:dev` | API in watch mode |
| `npm test` | unit tests |
| `npm run test:cov` | tests with coverage |
| `npm run migration:generate -- src/database/migrations/Name` | generate a migration (space after `--`) |
| `npm run migration:run` | run migrations |
| `npm run migration:revert` | revert the last migration |
| `npm run seed` | create the CFMV profession and admin user |

HTTP collection: [`apps/backend/bruno`](apps/backend/bruno).

### Routes

| Method | Route | Auth |
| --- | --- | --- |
| `POST` | `/auth/register` | public |
| `POST` | `/auth/login` | public |
| `GET` | `/professions` | public |
| `GET` | `/professions/:id` | public |
| `POST` | `/professions` | JWT + `admin` |
| `PATCH` | `/professions/:id` | JWT + `admin` |
| `DELETE` | `/professions/:id` | JWT + `admin` |

## Project Structure

```
apps/backend/        NestJS (auth, professions, database, bruno)
packages/            workspaces (empty)
docker-compose.yml
```

## Status

Maintaining

## License

[MIT](./LICENSE)
