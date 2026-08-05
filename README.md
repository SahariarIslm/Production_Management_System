# Production Management System

A Dockerized production management system for a manufacturing workflow:

- Receive raw material batches into inventory.
- Produce semi-finished batches from raw materials.
- Produce finished batches from semi-finished batches.
- Maintain independent inventory for raw, semi-finished, and finished products.
- Track production history and trace finished batches back to source materials.
- Process production completion asynchronously through RabbitMQ.

## Tech Stack

- Backend: Laravel 12, PHP 8.4, MySQL 8
- Frontend: React 19, Vite, Axios, React Router, Tailwind CSS
- Queue: RabbitMQ with management UI
- Infrastructure: Docker Compose, Nginx, Supervisor, phpMyAdmin

## Prerequisites

Install these on your machine before running the project:

- Git
- Docker Desktop or Docker Engine with Docker Compose

You do not need to install PHP, Composer, Node, MySQL, or RabbitMQ locally. Docker handles them.

## Clone The Project

```bash
git clone https://github.com/SahariarIslm/Production_Management_System.git
cd Production_Management_System
```

## Environment Setup

Create the environment files from the examples:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
```

The default Docker configuration uses these credentials:

```text
Database: production_db
Database user: pms_user
Database password: pms_password
RabbitMQ user: pms_user
RabbitMQ password: pms_password
```

## Run Locally With Docker

Build and start all services:

```bash
docker compose up --build
```

To run in the background:

```bash
docker compose up --build -d
```

During first startup, the backend container will:

- Install Composer dependencies if `backend/vendor` is missing.
- Create the Laravel app key if missing.
- Wait for MySQL.
- Run database migrations.
- Run database seeders.
- Start PHP-FPM.

The worker container starts Supervisor and runs the Laravel queue worker for RabbitMQ jobs.

## Application URLs

After the containers are running:

```text
Frontend: http://localhost:5173
Backend API: http://localhost:8080/api
phpMyAdmin: http://localhost:8081
RabbitMQ Management: http://localhost:15672
```

RabbitMQ login:

```text
Username: pms_user
Password: pms_password
```

phpMyAdmin login:

```text
Server: mysql
Username: pms_user
Password: pms_password
```

## Useful Docker Commands

Stop all containers:

```bash
docker compose down
```

Stop containers and remove database/RabbitMQ volumes:

```bash
docker compose down -v
```

Rebuild without cache:

```bash
docker compose build --no-cache
docker compose up
```

View logs:

```bash
docker compose logs -f
```

View logs for one service:

```bash
docker compose logs -f backend
docker compose logs -f worker
docker compose logs -f frontend
```

Run Laravel Artisan commands:

```bash
docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed
docker compose exec backend php artisan route:list
```

Run frontend commands:

```bash
docker compose exec frontend npm run build
docker compose exec frontend npm run lint
```

## Main Workflow

1. Open the frontend at `http://localhost:5173`.
2. Go to `Master Data` and create raw materials, semi-finished products, and finished products.
3. Go to `Inventory` and receive raw material batches.
4. Go to `Production` and submit raw-material-to-semi-finished production.
5. Wait for the RabbitMQ worker to process the job.
6. Submit semi-finished-to-finished production.
7. Check `History` for processed production events.
8. Use `Traceability` to trace a finished batch back to semi-finished and raw material batches.

## API Endpoints

Base URL:

```text
http://localhost:8080/api
```

### Master Data

```http
GET    /raw-materials
POST   /raw-materials
GET    /raw-materials/{id}
PUT    /raw-materials/{id}
DELETE /raw-materials/{id}

GET    /semi-finished-products
POST   /semi-finished-products
GET    /semi-finished-products/{id}
PUT    /semi-finished-products/{id}
DELETE /semi-finished-products/{id}

GET    /finished-products
POST   /finished-products
GET    /finished-products/{id}
PUT    /finished-products/{id}
DELETE /finished-products/{id}
```

Example create raw material:

```bash
curl -X POST http://localhost:8080/api/raw-materials \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Steel Sheet\",\"sku\":\"RM-STL-001\",\"unit\":\"kg\"}"
```

### Receive Raw Material Batch

```http
POST /raw-materials/{id}/receive-batch
```

Example:

```bash
curl -X POST http://localhost:8080/api/raw-materials/1/receive-batch \
  -H "Content-Type: application/json" \
  -d "{\"batch_number\":\"RM-BATCH-001\",\"quantity\":500,\"received_at\":\"2026-08-05 10:00:00\"}"
```

### Production

Create a semi-finished batch from raw materials:

```http
POST /production/semi-finished
```

Example:

```bash
curl -X POST http://localhost:8080/api/production/semi-finished \
  -H "Content-Type: application/json" \
  -d "{\"semi_finished_product_id\":1,\"batch_number\":\"SF-BATCH-001\",\"quantity\":300,\"consumptions\":[{\"raw_material_id\":1,\"quantity\":300}]}"
```

Create a finished batch from semi-finished batches:

```http
POST /production/finished
```

Example:

```bash
curl -X POST http://localhost:8080/api/production/finished \
  -H "Content-Type: application/json" \
  -d "{\"finished_product_id\":1,\"batch_number\":\"FG-BATCH-001\",\"quantity\":100,\"consumptions\":[{\"semi_finished_batch_id\":1,\"quantity\":100}]}"
```

Production endpoints return `202 Accepted`. Inventory and history updates are completed by the RabbitMQ worker.

### Inventory, History, And Traceability

```http
GET /inventory
GET /production-history
GET /finished-batches/{id}/trace
```

## Troubleshooting

If the frontend cannot reach the API, confirm that `VITE_API_BASE_URL` is set to:

```text
http://localhost:8080/api
```

If migrations fail or old data causes conflicts, reset volumes:

```bash
docker compose down -v
docker compose up --build
```

If production jobs stay pending, check the worker and RabbitMQ:

```bash
docker compose logs -f worker
```

Then open RabbitMQ at `http://localhost:15672` and inspect the `production_events` queue.
