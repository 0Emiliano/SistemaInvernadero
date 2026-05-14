# 🔐 Sistema Invernadero - Access Credentials & URLs

## ✅ Port Forwarding Active
All services are now accessible via port-forwarding on localhost.

---

## 🌐 Frontend Dashboard

**URL**: http://localhost:3000

**Access**: Open in your browser now

**Features**:
- Real-time sensor monitoring dashboard
- Temperature and humidity graphs
- Active alerts display
- KPI metrics

**Note**: Dashboard will show mock data initially. To see real data, send telemetry via RabbitMQ.

---

## 🔌 Backend API

**Base URL**: http://localhost:8080

**Key Endpoints**:

### Health Check
```http
GET http://localhost:8080/actuator/health
```

### Analytics Dashboard (Main)
```http
GET http://localhost:8080/api/v1/analytics/dashboard/{greenhouseId}

Example:
GET http://localhost:8080/api/v1/analytics/dashboard/GW-001
```

Response example:
```json
{
  "success": true,
  "message": "Datos de analítica recuperados correctamente",
  "data": {
    "recentReadings": [],
    "averageTemperature24h": 0.0,
    "period": "LAST_24H"
  }
}
```

### Sensor Registry
```http
POST http://localhost:8080/sensors/register?greenhouseId=GW-001&sensorId=S01
GET http://localhost:8080/sensors/report/{greenhouseId}
```

### Ingest Telemetry
```http
POST http://localhost:8080/ingest/{greenhouseId}
Header: X-Manufacturer: BOSCH | HONEYWELL
Body: <binary or JSON payload>
```

### TCP Ingestion Server
```
Host: localhost
Port: 9000
Protocol: TCP
```

---

## 🐰 RabbitMQ Management Console

**URL**: http://localhost:15672

### Credentials:
- **Username**: `invernadero`
- **Password**: `rabbitmq-secure-password-change-me`

**Important Note**: Change this password in production!

### Access Steps:
1. Open http://localhost:15672 in browser
2. Enter username: `invernadero`
3. Enter password: `rabbitmq-secure-password-change-me`
4. Click "Login"

### What You Can Do:
- View exchanges and queues
- Publish test messages
- Monitor message rates
- Check connection status

### Key Resources:
- **Exchanges**: `invernadero.telemetry.exchange` (Topic type)
- **Queues**: 
  - `alarm.queue` - Processes temperature alerts
  - `persistence.queue` - Saves data to database

---

## 📊 Testing the System

### 1. Test Backend Health
```bash
# PowerShell
Invoke-WebRequest -Uri http://localhost:8080/actuator/health

# Or via browser:
# http://localhost:8080/actuator/health
```

### 2. Test Frontend
Simply open http://localhost:3000 in your browser

### 3. Send Test Telemetry via RabbitMQ

**Steps**:
1. Open http://localhost:15672
2. Login with credentials above
3. Go to **Exchanges** tab
4. Click `invernadero.telemetry.exchange`
5. Scroll down to "Publish message"
6. Fill in:
   - **Routing key**: `invernadero.GW-001.S01`
   - **Payload**:
   ```json
   {
     "sensorId": "S01",
     "greenhouseId": "GW-001",
     "temperature": 28.5,
     "humidity": 65.0,
     "manufacturer": "BOSCH",
     "timestamp": "2026-05-14T03:11:00"
   }
   ```
7. Click "Publish message"

**Result**: 
- Message appears in `alarm.queue` and `persistence.queue`
- Data is saved to TimescaleDB
- Frontend dashboard updates with real data

### 4. Query Saved Data

```bash
# Connect to database
kubectl exec -it pod/timescaledb-6df8496b78-rskkm -n invernadero -- \
  psql -U admin -d invernadero_db

# In psql:
SELECT * FROM mediciones LIMIT 5;
SELECT COUNT(*) FROM mediciones;
```

---

## 🔑 Database Credentials

**TimescaleDB / PostgreSQL**

- **Host**: localhost (via kubectl port-forward)
- **Port**: 5432
- **Database**: `invernadero_db`
- **Username**: `admin`
- **Password**: `password`

**⚠️ Important**: Change these credentials in production!

**Connect via kubectl**:
```bash
kubectl exec -it pod/timescaledb-6df8496b78-rskkm -n invernadero -- \
  psql -U admin -d invernadero_db
```

---

## 📝 Service-to-Service Communication (Inside Cluster)

If you need to reference services from within Kubernetes manifests:

### Backend
- Internal URL: `http://invernadero-api-service:80`
- External URL (port-forward): `http://localhost:8080`

### Frontend
- Internal URL: `http://invernadero-frontend-service:80`
- External URL (port-forward): `http://localhost:3000`

### RabbitMQ
- Internal URL: `amqp://invernadero:rabbitmq-secure-password-change-me@rabbitmq-service:5672`
- Management UI: `http://rabbitmq-service:15672`
- Management URL (port-forward): `http://localhost:15672`

### TimescaleDB
- Internal URL: `postgresql://admin:password@timescaledb-service:5432/invernadero_db`
- External URL (if port-forwarded): `postgresql://admin:password@localhost:5432/invernadero_db`

---

## 🔧 Troubleshooting Access Issues

### Port-forwarding not working?
```bash
# Check if port-forward is running
kubectl get pods -n invernadero -o wide

# Verify services exist
kubectl get svc -n invernadero

# Manually restart port-forward
kubectl port-forward svc/invernadero-api-service 8080:80 -n invernadero --address=0.0.0.0
```

### Can't reach backend?
```bash
# Check backend pod logs
kubectl logs -f deployment/invernadero-backend -n invernadero

# Check if service exists
kubectl get svc invernadero-api-service -n invernadero

# Verify pod is running
kubectl get pods -l app=invernadero-backend -n invernadero
```

### Can't reach frontend?
```bash
# Check frontend pod logs
kubectl logs -f deployment/invernadero-frontend -n invernadero

# Verify pod is running
kubectl get pods -l app=invernadero-frontend -n invernadero
```

### RabbitMQ login fails?
```bash
# Verify RabbitMQ pod is running
kubectl get pods -l app=rabbitmq -n invernadero

# Check RabbitMQ logs
kubectl logs -f deployment/rabbitmq -n invernadero

# Verify credentials
kubectl get secret invernadero-rabbitmq-secret -n invernadero -o yaml
```

---

## 📚 Quick Reference

| Service | URL | Type | Credentials |
|---------|-----|------|-------------|
| Frontend | http://localhost:3000 | HTTP | None |
| Backend API | http://localhost:8080 | HTTP | None |
| RabbitMQ UI | http://localhost:15672 | HTTP | invernadero / rabbitmq-secure-password-change-me |
| TimescaleDB | localhost:5432 | PostgreSQL | admin / password |

---

## 🚀 Example curl Commands (if using bash/Linux)

```bash
# Backend health
curl http://localhost:8080/actuator/health

# Analytics dashboard
curl http://localhost:8080/api/v1/analytics/dashboard/GW-001

# Register sensor
curl -X POST "http://localhost:8080/sensors/register?greenhouseId=GW-001&sensorId=S01"

# Check frontend
curl http://localhost:3000
```

---

## 📊 Kubernetes Commands for Service Access

```bash
# List all services
kubectl get svc -n invernadero

# Get specific service details
kubectl get svc invernadero-api-service -n invernadero -o wide

# Describe service
kubectl describe svc invernadero-api-service -n invernadero

# Port-forward backend
kubectl port-forward svc/invernadero-api-service 8080:80 -n invernadero --address=0.0.0.0

# Port-forward frontend
kubectl port-forward svc/invernadero-frontend-service 3000:80 -n invernadero --address=0.0.0.0

# Port-forward RabbitMQ
kubectl port-forward svc/rabbitmq-management 15672:15672 -n invernadero --address=0.0.0.0
```

---

**Port-forwarding Status**: ✅ Active
**Frontend**: ✅ http://localhost:3000
**Backend**: ✅ http://localhost:8080
**RabbitMQ**: ✅ http://localhost:15672

All services are now accessible!

