#!/bin/bash

# Sistema Invernadero - Local Setup Script
# Simplifies getting the project running locally

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🌱 Sistema Invernadero - Local Setup                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker Desktop."
    echo "   https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose not found."
    exit 1
fi

echo "✅ Docker found: $(docker --version)"
echo "✅ docker-compose found: $(docker-compose --version)"
echo ""

# Check if already running
if docker-compose ps | grep -q "Up"; then
    echo "⚠️  Services already running!"
    echo ""
    echo "Options:"
    echo "  1. Continue (new images will be built)"
    echo "  2. Stop first (make stop) and restart"
    echo "  3. Restart services (make restart)"
    echo ""
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

echo "🔨 Building Docker images..."
docker-compose build --no-cache

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready (30 seconds)..."
sleep 30

echo ""
echo "📊 Checking service status..."
docker-compose ps

echo ""
echo "✅ Testing services..."

# Test backend
echo -n "  Backend API: "
if curl -s http://localhost:8080/api/v1/health > /dev/null 2>&1; then
    echo "✅ UP"
else
    echo "⏳ Starting (may take a moment)"
fi

# Test frontend
echo -n "  Frontend: "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ UP"
else
    echo "⏳ Starting"
fi

# Test RabbitMQ
echo -n "  RabbitMQ: "
if curl -s http://localhost:15672 > /dev/null 2>&1; then
    echo "✅ UP"
else
    echo "⏳ Starting"
fi

# Test Database
echo -n "  Database: "
if docker-compose exec -T timescaledb pg_isready -U admin &> /dev/null; then
    echo "✅ UP"
else
    echo "⏳ Starting"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ Sistema Invernadero is now running!                    ║"
echo "║                                                            ║"
echo "║  🌐 Frontend:  http://localhost:3000                       ║"
echo "║  🔌 Backend:   http://localhost:8080                       ║"
echo "║  🐰 RabbitMQ:  http://localhost:15672 (guest/guest)        ║"
echo "║  🗄️  Database:  localhost:5432 (admin/password)            ║"
echo "║                                                            ║"
echo "║  Commands:                                                 ║"
echo "║    make help     - Show all commands                       ║"
echo "║    make logs     - View live logs                          ║"
echo "║    make stop     - Stop services                           ║"
echo "║    make clean    - Clean up everything                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🎯 Next steps:"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Go to 'Ingestion' tab and send test telemetry"
echo "  3. Watch data appear in the Dashboard"
echo "  4. Check RabbitMQ at http://localhost:15672"
echo ""
