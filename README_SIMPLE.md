# 🌱 Sistema Invernadero

Simple & Fast greenhouse monitoring system with real-time telemetry, sensor management, and live alerts.

**Tech Stack**: React • Spring Boot • RabbitMQ • TimescaleDB • Docker Compose

---

## 🚀 Quick Start (30 seconds)

```bash
# Clone & navigate
git clone https://github.com/0Emiliano/SistemaInvernadero.git
cd SistemaInvernadero

# Start everything with one command
make quick-start

# Open browser
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8080
# RabbitMQ:  http://localhost:15672
```

That's it! All services running locally with real database, messaging, and API.

---

## 📋 Available Commands

```bash
make help              # Show all commands
make start             # Start all services
make stop              # Stop services
make restart           # Restart services
make logs              # View all logs
make status            # Check container status
make clean             # Remove containers & volumes

# Service access
make shell-backend     # Connect to backend
make shell-db          # Connect to database
make shell-rabbitmq    # Open RabbitMQ UI

# Development
make build             # Build images
make test-health       # Health check all services
```

---

## 📍 Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| Backend API | http://localhost:8080 | - |
| RabbitMQ | http://localhost:15672 | guest / guest |
| Database | localhost:5432 | admin / password |

---

## ✨ Features

### Dashboard
- 📊 Real-time temperature & humidity graphs
- ⚡ Live KPI metrics
- 🔄 Auto-refresh every 10 seconds

### Ingestion
- 📤 Send telemetry data via HTTP
- 🎯 Register new sensors
- ✅ Instant feedback

### Sensors
- 📱 View all connected sensors
- 🌡️ Last reading & status
- 👨‍🔧 Real-time monitoring

### Alerts
- 🚨 Critical temperature alerts
- 📍 Sensor location & timestamp
- 📈 Alert history

---

## 🏗️ Architecture

```
┌─────────────────────────┐
│   React Frontend        │ Port 3000
│   Dashboard UI          │
└────────────┬────────────┘
             │ HTTP
┌────────────▼────────────┐
│  Spring Boot Backend    │ Port 8080
│  REST API               │
└──────┬──────────┬───────┘
       │ AMQP     │ SQL
       │          │
       ▼          ▼
    ┌──────────────────────┐
    │    RabbitMQ          │ Port 5672
    │    Messaging         │
    └─────────┬────────────┘
              │
    ┌─────────▼────────────┐
    │  TimescaleDB         │ Port 5432
    │  Time-Series DB      │
    │  PostgreSQL 15       │
    └──────────────────────┘
```

---

## 🎮 Usage Examples

### Send Telemetry Data (Frontend)
1. Open http://localhost:3000
2. Go to "Ingestion" tab
3. Fill greenhouse ID, sensor ID, temperature, humidity
4. Click "Send Telemetry"
5. Data appears in Dashboard instantly

### Via API (curl)
```bash
curl -X POST http://localhost:8080/api/v1/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "greenhouseId": "GW-001",
    "sensorId": "S01",
    "temperature": 25.5,
    "humidity": 65.0,
    "manufacturer": "BOSCH",
    "timestamp": "2026-05-14T10:00:00"
  }'
```

### Check Dashboard Data
```bash
curl http://localhost:8080/api/v1/analytics/dashboard/GW-001
```

### Get Active Alerts
```bash
curl http://localhost:8080/api/v1/alerts
```

### List Sensors
```bash
curl http://localhost:8080/api/v1/sensors
```

---

## 📦 Backend API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/ingest` | Send telemetry |
| GET | `/api/v1/analytics/dashboard/{id}` | Dashboard data |
| GET | `/api/v1/alerts` | List critical alerts |
| GET | `/api/v1/sensors` | List all sensors |
| POST | `/api/v1/sensors/register` | Register new sensor |
| GET | `/api/v1/health` | Health check |

---

## 🧪 Local Database Access

```bash
# Connect to PostgreSQL
psql -h localhost -U admin -d invernadero_db

# List tables
\dt

# View sensor readings
SELECT * FROM mediciones LIMIT 10;

# Query temperature average last 24h
SELECT AVG(temperature) FROM mediciones 
WHERE timestamp > NOW() - INTERVAL '24 hours';
```

---

## 🐳 Docker Services

All services run in Docker containers via docker-compose:

- **timescaledb** - PostgreSQL 15 with TimescaleDB extension
- **rabbitmq** - Message broker (AMQP)
- **backend** - Spring Boot REST API
- **frontend** - React + Vite dev server

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Services
```bash
make stop
# or
docker-compose down
```

### Clean Everything
```bash
make clean
# or
docker-compose down -v  # -v removes volumes
```

---

## 💾 Data Persistence

- **Database**: TimescaleDB with hypertable optimization for time-series data
- **RabbitMQ**: Message persistence enabled
- **Volumes**: Both `postgres_data` and `rabbitmq_data` persist across restarts

---

## 🔧 Troubleshooting

### Frontend not loading?
```bash
# Check if running
curl http://localhost:3000

# View logs
make logs-frontend

# Rebuild
docker-compose rebuild frontend
make start
```

### Backend API not responding?
```bash
# Check health
curl http://localhost:8080/api/v1/health

# View logs
make logs-backend

# Check database connection
docker-compose exec backend curl http://timescaledb:5432
```

### RabbitMQ not accessible?
```bash
# Check health
curl http://localhost:15672

# View logs
make logs-rabbitmq

# Reset with
make clean
make start
```

### Database connection failed?
```bash
# Check if running
docker-compose ps | grep timescaledb

# View logs
make logs-db

# Connect directly
make shell-db
```

---

## 📊 Telemetry Format

All sensor readings use this format:

```json
{
  "sensorId": "S01",
  "greenhouseId": "GW-001",
  "temperature": 25.5,
  "humidity": 65.0,
  "manufacturer": "BOSCH",
  "timestamp": "2026-05-14T10:00:00"
}
```

**Supported Manufacturers**: BOSCH, HONEYWELL (extensible)

**Temperature Alert Threshold**: 35°C (configurable)

---

## 🚀 Production Deployment

This setup is for **local development**. For production:

1. **Kubernetes**: Use manifests in `k8s/` directory
2. **Secrets**: Use external secret management (Vault, AWS Secrets Manager)
3. **Database**: Use managed PostgreSQL (RDS, Cloud SQL)
4. **Cache**: Add Redis for performance
5. **Security**: Add API authentication (JWT)
6. **Observability**: Add Prometheus, Grafana, ELK stack

---

## 📚 Project Structure

```
SistemaInvernadero/
├── src/                    # React Frontend
│   ├── components/
│   │   └── Dashboard.tsx   # Main UI component
│   └── services/
│       └── analyticsService.ts
├── java-backend/           # Spring Boot Backend
│   ├── src/
│   │   └── main/java/.../
│   │       ├── modules/
│   │       │   ├── analytics/    # AnalyticsController
│   │       │   ├── ingestion/    # IngestionController
│   │       │   ├── alarm/        # AlarmService
│   │       │   └── persistence/  # PersistenceService
│   │       └── config/           # RabbitConfig
│   └── Dockerfile
├── docker-compose.yml      # Services orchestration
├── Dockerfile              # Frontend container
├── Makefile               # Commands
└── package.json           # Frontend deps
```

---

## 🤝 Contributing

1. Make changes
2. Test locally: `make start && npm install`
3. Verify: `make test-health`
4. Commit & push

---

## 📝 License

MIT

---

## 🎯 Next Steps

After local setup works:

1. **Add more sensors**: Use the "Register New Sensor" feature
2. **Monitor trends**: Watch temperature/humidity graphs
3. **Set alerts**: Customize temperature thresholds
4. **Scale up**: Deploy to Kubernetes using `k8s/` manifests
5. **Add observability**: Enable Prometheus, Grafana for metrics

---

**Made with ❤️ for smart greenhouse farming**

For issues or questions: Check logs with `make logs` or review backend output.
