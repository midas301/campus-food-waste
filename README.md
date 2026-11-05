# Campus Food Waste Management System

A web app that connects campus food providers (canteens, hostel messes, event organisers) with
recipients, so surplus food is redistributed instead of wasted. It also records waste and shows
analytics to admins.

## Tech stack
- **Frontend:** React (Vite), React Router, Recharts
- **Backend:** Node.js, Express, JWT authentication
- **SQL database:** MySQL 8 (transactional data)
- **NoSQL database:** MongoDB 7 (waste logs, notifications, analytics)
- **Infrastructure:** Docker Compose for both databases

## Why SQL and NoSQL
- **MySQL** holds users, categories, locations, food items, requests and distributions. These are
  related, and approving or distributing a request must be atomic, so the app uses foreign keys,
  constraints and stored procedures with transactions.
- **MongoDB** holds `waste_logs` (the weak entity in the ER diagram) and `notifications`. They are
  append-heavy, read mostly in aggregate, and benefit from a denormalised food snapshot, so no joins
  are needed for analytics.
- **Where they connect:** a background job marks expired food in MySQL and writes a waste log to
  MongoDB. The admin summary combines MySQL (distributed) and MongoDB (wasted).

## Documents
- ER diagram: `docs/er-diagram.png`
- API reference: `docs/api-contract.md`
- MongoDB design: `database/mongo/README.md`
- SQL: `database/sql/` (schema, procedures, seed data, `reports/reports.sql`)

## Getting started

Requirements: Git, Node.js 20+, Docker Desktop.

```bash
git clone https://github.com/midas301/campus-food-waste.git
cd campus-food-waste

# 1. Start MySQL and MongoDB
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env      # then set JWT_SECRET in .env
npm install
npm run dev               # http://localhost:4000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev               # http://localhost:5173
```

## Roles
- **Provider:** posts food, approves or rejects requests, marks food distributed, logs waste
- **Recipient:** browses available food, requests it, tracks requests
- **Admin:** views the analytics dashboard and all waste logs

Admins cannot self-register. Register a normal user, then promote it:

```bash
docker exec cfw-mysql mysql -uroot -prootpass campus_food \
  -e "UPDATE users SET role='Admin' WHERE email='you@example.com';"
```

## Notes
- MySQL runs on `+05:30` (set in `docker-compose.yml`) so expiry times match campus local time.
- Initial SQL files run only on a fresh volume. To reset: `docker compose down -v && docker compose up -d`.
- Lint: `npm run lint` in `frontend` and `backend`.

## Team
| Member | Responsibility |
|---|---|
| midas301 | (MySQL, backend API, documentation) |
| shahjuhi22 | (frontend, MongoDB, analytics) |
