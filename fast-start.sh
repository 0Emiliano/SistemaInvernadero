#!/bin/bash

# FAST START - Option B (Recommended)
# Levanta Backend + Infra en Docker + Frontend localmente
# Total time: ~2 minutos

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🚀 FAST START - Backend Docker + Frontend Local           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if docker-compose is running
if docker-compose ps | grep -q "Up"; then
    echo "⚠️  Some containers already running"
    read -p "Stop them first? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down
    fi
fi

echo "🔨 Step 1: Stop previous builds (if any)"
docker-compose down 2>/dev/null

echo ""
echo "🚀 Step 2: Starting backend infrastructure (30 seconds)..."
docker-compose up -d timescaledb rabbitmq

# Wait for databases
echo "⏳ Waiting for services to be ready..."
sleep 15

# Try to start backend - will build first time
echo ""
echo "🔨 Step 3: Building & starting backend (first time: 3-5 min)..."
docker-compose up -d backend

# Give backend time to start
sleep 30

echo ""
echo "📦 Step 4: Installing frontend dependencies..."
npm install 2>&1 | grep -E "(added|up to date|found)"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ All services ready!                                    ║"
echo "║                                                            ║"
echo "║  🔌 Backend:      http://localhost:8080                    ║"
echo "║  🗄️  Database:     localhost:5432                          ║"
echo "║  🐰 RabbitMQ:    http://localhost:15672 (guest/guest)      ║"
echo "║                                                            ║"
echo "║  🎬 Starting frontend...                                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Start frontend
npm run dev

# If we get here (Ctrl+C), show cleanup info
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Frontend stopped. Backend services still running.        ║"
echo "║                                                            ║"
echo "║  To stop everything:                                      ║"
echo "║    docker-compose down                                    ║"
echo "║                                                            ║"
echo "║  To start again:                                          ║"
echo "║    bash fast-start.sh                                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
