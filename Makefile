.PHONY: help start stop logs clean build shell-backend shell-db restart status

help:
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║          Sistema Invernadero - Make Commands               ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "Usage: make [command]"
	@echo ""
	@echo "Commands:"
	@echo "  make start              - Start all services (docker-compose up)"
	@echo "  make stop               - Stop all services (docker-compose down)"
	@echo "  make restart            - Restart all services"
	@echo "  make build              - Build Docker images"
	@echo "  make logs               - View all logs (follow mode)"
	@echo "  make logs-backend       - View backend logs only"
	@echo "  make logs-frontend      - View frontend logs only"
	@echo "  make logs-db            - View database logs only"
	@echo "  make logs-rabbitmq      - View RabbitMQ logs only"
	@echo "  make shell-backend      - Connect to backend container shell"
	@echo "  make shell-db           - Connect to database psql"
	@echo "  make shell-rabbitmq     - Connect to RabbitMQ management"
	@echo "  make status             - Show container status"
	@echo "  make clean              - Remove all containers and volumes"
	@echo ""
	@echo "Services URLs:"
	@echo "  Frontend:   http://localhost:3000"
	@echo "  Backend:    http://localhost:8080"
	@echo "  RabbitMQ:   http://localhost:15672 (guest/guest)"
	@echo "  Database:   localhost:5432 (admin/password)"
	@echo ""

start:
	@echo "🚀 Starting Sistema Invernadero..."
	docker-compose up -d
	@echo "✅ Services started!"
	@echo ""
	@echo "📍 Frontend:  http://localhost:3000"
	@echo "📍 Backend:   http://localhost:8080"
	@echo "📍 RabbitMQ:  http://localhost:15672"
	@echo "📍 Database:  localhost:5432"
	@echo ""
	@echo "Waiting for services to be ready..."
	@sleep 5
	@docker-compose ps

stop:
	@echo "🛑 Stopping Sistema Invernadero..."
	docker-compose down
	@echo "✅ Services stopped!"

restart: stop start

build:
	@echo "🔨 Building Docker images..."
	docker-compose build --no-cache
	@echo "✅ Images built!"

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f timescaledb

logs-rabbitmq:
	docker-compose logs -f rabbitmq

shell-backend:
	@echo "🔌 Connecting to backend container..."
	docker-compose exec backend /bin/sh

shell-db:
	@echo "🔌 Connecting to database..."
	docker-compose exec timescaledb psql -U admin -d invernadero_db

shell-rabbitmq:
	@echo "🔌 Opening RabbitMQ Management UI..."
	@echo "   http://localhost:15672"
	@echo "   Username: guest"
	@echo "   Password: guest"
	open http://localhost:15672 || xdg-open http://localhost:15672 || echo "Open http://localhost:15672 in your browser"

status:
	@echo "📊 Container Status:"
	@docker-compose ps

clean:
	@echo "🗑️  Cleaning up containers and volumes..."
	docker-compose down -v
	@echo "✅ Cleanup complete!"

# Development helpers
dev:
	@echo "👨‍💻 Starting development environment..."
	npm install
	make start
	@echo "✅ Development environment ready!"

test-health:
	@echo "🏥 Testing service health..."
	@echo "Backend: $$(curl -s http://localhost:8080/api/v1/health || echo 'DOWN')"
	@echo "Frontend: $$(curl -s http://localhost:3000 > /dev/null && echo 'UP' || echo 'DOWN')"
	@echo "Database: $$(docker-compose exec timescaledb pg_isready -U admin 2>/dev/null && echo 'UP' || echo 'DOWN')"
	@echo "RabbitMQ: $$(curl -s http://localhost:15672 > /dev/null && echo 'UP' || echo 'DOWN')"

logs-follow:
	@echo "📝 Following all logs in real-time..."
	@echo "Press Ctrl+C to stop"
	docker-compose logs -f --tail=100

# Database operations
db-shell:
	docker-compose exec timescaledb psql -U admin -d invernadero_db

db-seed:
	@echo "🌱 Seeding database with test data..."
	docker-compose exec timescaledb psql -U admin -d invernadero_db < ./scripts/seed.sql

# Quick start (one command)
quick-start: build start
	@echo ""
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║  ✅ Sistema Invernadero is now running!                    ║"
	@echo "║                                                            ║"
	@echo "║  🌐 Frontend:  http://localhost:3000                       ║"
	@echo "║  🔌 Backend:   http://localhost:8080                       ║"
	@echo "║  🐰 RabbitMQ:  http://localhost:15672                      ║"
	@echo "║  🗄️  Database:  localhost:5432                             ║"
	@echo "║                                                            ║"
	@echo "║  Use 'make help' for more commands                         ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""

.DEFAULT_GOAL := help
