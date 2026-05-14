# ✅ Backend API - Correct Usage

## ⚠️ The Issue

You were accessing `http://localhost:8080/` (root path) which returns:
```json
{"success":false,"message":"No static resource .","data":null}
```

**Reason**: The backend is a pure REST API - it doesn't serve static files or a root HTML page.

---

## ✅ Correct Endpoints

### 1. Health Check
```
GET http://localhost:8080/actuator/health
```

Response:
```json
{
  "status": "UP"
}
```

---

### 2. Analytics Dashboard (Main Endpoint)
```
GET http://localhost:8080/api/v1/analytics/dashboard/{greenhouseId}
```

**Example**:
```
GET http://localhost:8080/api/v1/analytics/dashboard/GW-001
```

**Response**:
```json
{
  "success": true,
  "message": "Datos de analitica recuperados correctamente",
  "data": {
    "recentReadings": [],
    "averageTemperature24h": 0.0,
    "period": "LAST_24H"
  }
}
```

**Note**: `recentReadings` is empty because no data has been sent yet. Send telemetry via RabbitMQ to populate it.

---

### 3. Sensor Registration
```
POST http://localhost:8080/sensors/register
```

**Query Parameters**:
- `greenhouseId` - Greenhouse identifier (string)
- `sensorId` - Sensor identifier (string)

**Example**:
```
POST http://localhost:8080/sensors/register?greenhouseId=GW-001&sensorId=S01
```

---

### 4. Sensor Report
```
GET http://localhost:8080/sensors/report/{greenhouseId}
```

**Example**:
```
GET http://localhost:8080/sensors/report/GW-001
```

---

### 5. Telemetry Ingestion (HTTP)
```
POST http://localhost:8080/ingest/{greenhouseId}
```

**Headers**:
- `X-Manufacturer: BOSCH | HONEYWELL`

**Body**: Binary or JSON payload

**Example**:
```
POST http://localhost:8080/ingest/GW-001
Header: X-Manufacturer: BOSCH
Body: <binary_payload>
```

---

### 6. TCP Ingestion Server
```
Host: localhost
Port: 9000
Protocol: TCP
```

Send binary sensor data directly via TCP socket to port 9000.

---

## 🧪 Testing in Browser

### Test 1: Health Check
```
http://localhost:8080/actuator/health
```
Expected: `{"status":"UP"}`

### Test 2: Get Dashboard Data
```
http://localhost:8080/api/v1/analytics/dashboard/GW-001
```
Expected: Analytics data (empty until you send telemetry)

---

## 🧪 Testing with Frontend

The React frontend at `http://localhost:3000` calls:
```
GET http://localhost:8080/api/v1/analytics/dashboard/{greenhouseId}
```

The frontend automatically handles the response and displays the data on the dashboard.

---

## 📤 Sending Test Data

To populate the analytics dashboard with real data, send telemetry via RabbitMQ:

1. Open http://localhost:15672 (RabbitMQ UI)
2. Login: `invernadero` / `rabbitmq-secure-password-change-me`
3. Go to **Exchanges** → `invernadero.telemetry.exchange`
4. Click **Publish message**
5. Set:
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
6. Click **Publish message**

---

## ✅ Verify Data Stored

After sending telemetry, check the database:

```bash
kubectl exec -it pod/timescaledb-6df8496b78-rskkm -n invernadero -- \
  psql -U admin -d invernadero_db -c "SELECT * FROM mediciones LIMIT 5;"
```

Expected: Data rows appear.

---

## ✅ Verify in Dashboard

After storing data:

1. Refresh `http://localhost:3000`
2. You should see:
   - Temperature graphs populated
   - Average temperature calculated
   - Recent readings displayed

---

## 📋 All Available Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/actuator/health` | Health check |
| GET | `/api/v1/analytics/dashboard/{greenhouseId}` | Get dashboard data |
| POST | `/sensors/register` | Register a sensor |
| GET | `/sensors/report/{greenhouseId}` | Get sensor report |
| POST | `/ingest/{greenhouseId}` | HTTP telemetry ingestion |
| TCP | `:9000` | TCP sensor ingestion |

---

## 🔧 Troubleshooting

### Getting error responses?
- Check that you're using the correct endpoint path
- Root path `/` is not mapped → will return error
- Always use `/api/v1/analytics/dashboard/{greenhouseId}`

### No data appearing in dashboard?
- Send telemetry first via RabbitMQ
- Check database with: `SELECT COUNT(*) FROM mediciones;`
- Verify RabbitMQ messages are being processed

### API returns 404?
- Check endpoint spelling
- Verify pod is running: `kubectl get pods -n invernadero`
- Check logs: `kubectl logs -f deployment/invernadero-backend -n invernadero`

---

**Note**: The backend is a pure REST API with no static file serving. Access the frontend at http://localhost:3000 for the UI, and use the API endpoints above for data operations.

