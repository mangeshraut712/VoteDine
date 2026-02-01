# VoteDine - Project Management
.PHONY: help install dev build test clean db-up db-down db-migrate db-reset

# Default target
help:
	@echo "VoteDine - Available Commands"
	@echo "=========================================="
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make install        Install dependencies for both frontend and backend"
	@echo ""
	@echo "Development:"
	@echo "  make dev            Start all services with Docker Compose"
	@echo "  make dev-local      Start database with Docker, run apps locally"
	@echo ""
	@echo "Build:"
	@echo "  make build          Build production Docker images"
	@echo "  make build-frontend Build frontend production image"
	@echo "  make build-backend  Build backend production image"
	@echo ""
	@echo "Database:"
	@echo "  make db-up          Start PostgreSQL and Redis"
	@echo "  make db-down        Stop PostgreSQL and Redis"
	@echo "  make db-migrate     Run Prisma migrations"
	@echo "  make db-reset       Reset database (dangerous!)"
	@echo ""
	@echo "Testing:"
	@echo "  make test           Run all tests"
	@echo "  make test-frontend  Run frontend tests"
	@echo "  make test-backend   Run backend tests"
	@echo "  make test-e2e       Run E2E tests"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint           Run linting on both projects"
	@echo "  make type-check     Run TypeScript type checking"
	@echo "  make format         Format code with Prettier"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean          Remove all containers, volumes, and node_modules"
	@echo "  make prune          Deep clean including Docker system prune"
	@echo ""

# Installation
install:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing Prisma client..."
	cd backend && npx prisma generate

# Development
dev:
	docker-compose up -d
	@echo "Services started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend API: http://localhost:3001"
	@echo "API Docs: http://localhost:3001/docs"

dev-local: db-up
	@echo "Starting database services..."
	@sleep 3
	@echo "Starting backend in background..."
	cd backend && npm run dev &
	@echo "Starting frontend..."
	cd frontend && npm run dev

# Build
build:
	docker-compose build

build-frontend:
	cd frontend && npm run build

build-backend:
	cd backend && npm run build

# Database
db-up:
	docker-compose up -d postgres redis

db-down:
	docker-compose stop postgres redis

db-migrate:
	cd backend && npx prisma migrate dev

db-reset:
	@echo "WARNING: This will delete all data!"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	docker-compose stop postgres
	docker-compose rm -f postgres
	docker volume rm cs375group1_postgres_data || true
	docker-compose up -d postgres
	@sleep 5
	cd backend && npx prisma migrate dev

# Testing
test: test-frontend test-backend

test-frontend:
	cd frontend && npm run test

test-backend:
	cd backend && npm run test

test-e2e:
	cd frontend && npm run test:e2e

# Code Quality
lint:
	cd frontend && npm run lint
	cd backend && npm run lint

type-check:
	cd frontend && npm run type-check
	cd backend && npm run type-check

format:
	cd frontend && npm run format
	cd backend && npm run format

# Maintenance
clean:
	@echo "Stopping all containers..."
	docker-compose down -v
	@echo "Removing node_modules..."
	rm -rf frontend/node_modules backend/node_modules
	@echo "Removing build outputs..."
	rm -rf frontend/.next frontend/dist backend/dist
	@echo "Clean complete!"

prune: clean
	@echo "Pruning Docker system..."
	docker system prune -f
	docker volume prune -f
