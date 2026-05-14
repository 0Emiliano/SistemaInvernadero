# 🚀 Next Steps to Production-Ready Sistema Invernadero

Your system is **deployed and functional**. Here's the roadmap to make it production-perfect:

---

## 📊 Phase 1: Validate End-to-End Data Flow (TODAY - 2-3 hours)

### Step 1.1: Send Test Telemetry
**Goal**: Verify sensor → adapter → RabbitMQ → database flow works

1. Open http://localhost:15672
2. Login: `invernadero` / `rabbitmq-secure-password-change-me`
3. Go to **Exchanges** → `invernadero.telemetry.exchange`
4. Click **Publish message** and send:
```json
{
  "sensorId": "S01",
  "greenhouseId": "GW-001",
  "temperature": 28.5,
  "humidity": 65.0,
  "manufacturer": "BOSCH",
  "timestamp": "2026-05-14T10:00:00"
}
```
5. Publish 5-10 messages with different temperatures (25, 28, 32, 35, 38 to test alarm triggers)

**Status Check**:
- ✅ Messages appear in `alarm.queue` and `persistence.queue`
- ✅ No errors in RabbitMQ

### Step 1.2: Verify Data Persistence
**Goal**: Confirm data reaches TimescaleDB

```bash
kubectl exec -it pod/timescaledb-6df8496b78-rskkm -n invernadero -- \
  psql -U admin -d invernadero_db -c "SELECT * FROM mediciones LIMIT 10;"
```

**Expected**: 5-10 rows with your test data

**If empty**: Check backend logs for errors:
```bash
kubectl logs -f deployment/invernadero-backend -n invernadero --tail=50
```

### Step 1.3: Test Analytics Endpoint
**Goal**: Verify dashboard data retrieval

```bash
# Test via browser or curl
http://localhost:8080/api/v1/analytics/dashboard/GW-001
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Datos de analitica recuperados correctamente",
  "data": {
    "recentReadings": [
      {"sensorId": "S01", "temperature": 28.5, "humidity": 65.0, ...}
    ],
    "averageTemperature24h": 31.2,
    "period": "LAST_24H"
  }
}
```

### Step 1.4: Check Frontend Dashboard
**Goal**: Verify UI displays real data

1. Open http://localhost:3000
2. Should see:
   - Graphs populated with temperature data
   - Average temperature displayed
   - Recent readings in cards

**If blank**: Frontend may still be using mock data. Check browser console for errors:
- Press F12 → Console tab
- Look for API call errors

**Fix if needed**: 
```bash
# Check frontend service connectivity
kubectl exec -it pod/invernadero-frontend-7556bffc96-jc6vc -n invernadero -- sh
# Inside pod:
wget http://invernadero-api-service:80/api/v1/analytics/dashboard/GW-001
```

**Status**: ✅ Mark TODO [1-4] as complete

---

## 🤖 Phase 2: Sensor Simulator (4-6 hours)

### Step 2.1: Create Sensor Simulator Script

Why? Manual testing doesn't scale. Create automation to continuously send data.

**Option A: Python Simulator** (Recommended)

Create `sensor-simulator.py`:
```python
import pika
import json
import time
import random
from datetime import datetime

def send_sensor_data(greenhouse_id="GW-001", sensor_id="S01", interval=5):
    """Send simulated sensor data every `interval` seconds"""
    
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host='rabbitmq-service',  # K8s service name
            port=5672,
            credentials=pika.PlainCredentials('invernadero', 'rabbitmq-secure-password-change-me')
        )
    )
    channel = connection.channel()
    
    # Declare exchange (if not exists)
    channel.exchange_declare(
        exchange='invernadero.telemetry.exchange',
        exchange_type='topic',
        durable=True
    )
    
    while True:
        # Simulate realistic sensor values
        temp = 22 + random.uniform(-2, 5)  # Range: 20-27°C
        humidity = 60 + random.uniform(-10, 10)  # Range: 50-70%
        
        message = {
            "sensorId": sensor_id,
            "greenhouseId": greenhouse_id,
            "temperature": round(temp, 1),
            "humidity": round(humidity, 1),
            "manufacturer": "BOSCH",
            "timestamp": datetime.now().isoformat()
        }
        
        routing_key = f"invernadero.{greenhouse_id}.{sensor_id}"
        
        channel.basic_publish(
            exchange='invernadero.telemetry.exchange',
            routing_key=routing_key,
            body=json.dumps(message),
            properties=pika.BasicProperties(
                content_type='application/json',
                delivery_mode=2  # Persistent
            )
        )
        
        print(f"[{datetime.now()}] Sent: {message}")
        time.sleep(interval)

if __name__ == "__main__":
    try:
        send_sensor_data(interval=10)  # Send every 10 seconds
    except KeyboardInterrupt:
        print("\nSimulator stopped")
```

**Option B: Java Inside Pod**

Or run inside the cluster as a Kubernetes Job.

### Step 2.2: Run Simulator
```bash
# Run simulator pod
kubectl run sensor-simulator \
  --image=python:3.11 \
  --restart=Never \
  -n invernadero \
  -- python /simulator/sensor-simulator.py
```

**Or run locally** (if Python installed):
```bash
pip install pika
python sensor-simulator.py
```

**Expected**: Data flowing continuously every 10 seconds

**Verify**:
```bash
# Check pod is running
kubectl get pod sensor-simulator -n invernadero

# Check logs
kubectl logs -f sensor-simulator -n invernadero
```

**Status**: ✅ Mark TODO [5] as complete

---

## 🛠️ Phase 3: Database Optimization (2-3 hours)

### Step 3.1: Verify Hypertable Setup
**Goal**: Confirm TimescaleDB optimizations are enabled

```bash
kubectl exec -it pod/timescaledb-6df8496b78-rskkm -n invernadero -- \
  psql -U admin -d invernadero_db -c "\dt mediciones"
```

**Expected**: Table should show as hypertable

### Step 3.2: Add Indexes for Performance
```bash
kubectl exec -it pod/timescaledb-6df8496b78-rskkm -n invernadero -- \
  psql -U admin -d invernadero_db << 'EOF'

-- Index on greenhouse_id for faster queries
CREATE INDEX idx_greenhouse ON mediciones(greenhouse_id);

-- Index on sensor_id
CREATE INDEX idx_sensor ON mediciones(sensor_id);

-- Composite index for common queries
CREATE INDEX idx_greenhouse_timestamp ON mediciones(greenhouse_id, timestamp DESC);

-- Check compression (TimescaleDB feature)
ALTER TABLE mediciones SET (timescaledb.compress, timescaledb.compress_orderby = 'timestamp DESC');
SELECT compress_chunk(i) FROM show_chunks('mediciones') i;

EOF
```

### Step 3.3: Setup Data Retention Policy
**Goal**: Automatically delete old data

```bash
kubectl exec -it pod/timescaledb-6df8496b78-rskkm -n invernadero -- \
  psql -U admin -d invernadero_db << 'EOF'

-- Keep data for 90 days
SELECT add_retention_policy('mediciones', INTERVAL '90 days');

-- Verify policy
SELECT * FROM timescaledb_information.jobs;

EOF
```

**Status**: ✅ Mark TODO [7-8] as complete

---

## 🔐 Phase 4: Security Hardening (3-4 hours)

### Step 4.1: Change Default Credentials

**RabbitMQ**:
```bash
kubectl exec -it pod/rabbitmq-5b8bf687c9-j2fts -n invernadero -- \
  rabbitmqctl change_password invernadero NEW_SECURE_PASSWORD_HERE
```

**Update K8s Secret**:
```bash
kubectl patch secret invernadero-rabbitmq-secret -n invernadero \
  -p '{"data":{"RABBITMQ_DEFAULT_PASS":"'$(echo -n 'NEW_SECURE_PASSWORD_HERE' | base64)'"}}'
```

**Restart Backend**:
```bash
kubectl rollout restart deployment/invernadero-backend -n invernadero
```

**PostgreSQL**:
```bash
kubectl exec -it pod/timescaledb-6df8496b78-rskkm -n invernadero -- \
  psql -U admin -d invernadero_db << 'EOF'
ALTER USER admin WITH PASSWORD 'NEW_SECURE_PASSWORD_HERE';
EOF
```

### Step 4.2: Add API Authentication (JWT)
**Goal**: Protect REST endpoints

Add to `backend/pom.xml`:
```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
  <groupId>io.jsonwebtoken</groupId>
  <artifactId>jjwt-api</artifactId>
  <version>0.12.3</version>
</dependency>
```

Create `JwtUtil.java`:
```java
@Component
public class JwtUtil {
    @Value("${jwt.secret:your-secret-key-here}")
    private String secret;
    
    public String generateToken(String userId) {
        return Jwts.builder()
            .subject(userId)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + 3600000)) // 1 hour
            .signWith(SignatureAlgorithm.HS256, secret)
            .compact();
    }
    
    public String extractUser(String token) {
        return Jwts.parser()
            .verifyWith(MacAlgorithm.HS256.key().build())
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();
    }
}
```

Create `SecurityConfig.java`:
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/v1/**").authenticated()
            )
            .addFilterBefore(new JwtFilter(), UsernamePasswordAuthenticationFilter.class)
            .csrf().disable();
        return http.build();
    }
}
```

**Status**: ✅ Mark TODO [9] as complete

---

## 📈 Phase 5: Monitoring & Observability (4-6 hours)

### Step 5.1: Add Prometheus Metrics

Add to `pom.xml`:
```xml
<dependency>
  <groupId>io.micrometer</groupId>
  <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

Access metrics:
```
http://localhost:8080/actuator/prometheus
```

### Step 5.2: Deploy Prometheus + Grafana

Create `prometheus-deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: invernadero
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:latest
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: config
          mountPath: /etc/prometheus/prometheus.yml
          subPath: prometheus.yml
      volumes:
      - name: config
        configMap:
          name: prometheus-config
---
apiVersion: v1
kind: Service
metadata:
  name: prometheus-service
  namespace: invernadero
spec:
  selector:
    app: prometheus
  ports:
  - port: 9090
  type: LoadBalancer
```

Deploy Grafana similarly for dashboards.

### Step 5.3: Add Application Metrics

```java
@Component
public class SensorMetrics {
    private final MeterRegistry meterRegistry;
    
    public SensorMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }
    
    public void recordSensorReading(String sensorId, double temperature) {
        meterRegistry.timer("sensor.reading.time").record(() -> {
            // Processing
        });
        meterRegistry.gauge("sensor.temperature", temperature);
    }
}
```

**Status**: ✅ Mark TODO [10, 14] as complete

---

## 🧪 Phase 6: Testing & Quality (6-8 hours)

### Step 6.1: Add Unit Tests
```java
@SpringBootTest
public class AnalyticsControllerTest {
    @MockBean
    private SensorReadingRepository repository;
    
    @Autowired
    private AnalyticsController controller;
    
    @Test
    public void testGetDashboardData() {
        // Test implementation
    }
}
```

### Step 6.2: Add Integration Tests for RabbitMQ
```java
@SpringBootTest
@EmbeddedRabbitMQ
public class PersistenceServiceTest {
    @Test
    public void testMessageConsumption() {
        // Send message
        // Verify persisted
    }
}
```

### Step 6.3: Add Adapter Tests
```java
@Test
public void testBoschAdapterParsing() {
    byte[] payload = new byte[]{/* binary data */};
    SensorReading reading = boschAdapter.adapt(payload);
    
    assertNotNull(reading);
    assertEquals("S01", reading.getSensorId());
}
```

**Status**: ✅ Mark TODO [6, 12-13] as complete

---

## 🚀 Phase 7: Deployment Preparation (3-4 hours)

### Step 7.1: Setup CI/CD Pipeline

Create `.github/workflows/build.yml`:
```yaml
name: Build and Deploy

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Backend
        run: docker build -t myregistry/backend:${{ github.sha }} ./java-backend
      - name: Build Frontend
        run: docker build -t myregistry/frontend:${{ github.sha }} .
      - name: Push Images
        run: docker push myregistry/backend:${{ github.sha }}
      - name: Deploy to K8s
        run: kubectl set image deployment/invernadero-backend backend=myregistry/backend:${{ github.sha }} -n invernadero
```

### Step 7.2: Backup Strategy

```bash
# Backup PostgreSQL
kubectl exec pod/timescaledb-6df8496b78-rskkm -n invernadero -- \
  pg_dump -U admin invernadero_db > backup-$(date +%s).sql
```

### Step 7.3: Disaster Recovery Plan
- Document RTO (Recovery Time Objective): 15 minutes
- Document RPO (Recovery Point Objective): 5 minutes
- Test backup restoration monthly

**Status**: ✅ Mark TODO [11, 13] as complete

---

## ✅ Phase 8: Production Checklist (1-2 hours)

Before going live, verify:

```
INFRASTRUCTURE
□ All pods are ready and healthy
□ Services have external IPs or ingress
□ PersistentVolumes are mounted correctly
□ Network policies are configured
□ Resource quotas are set

SECURITY
□ Secrets use production passwords
□ RBAC is configured
□ SSL/TLS certificates installed
□ API authentication is enabled
□ Database backups are tested

MONITORING
□ Prometheus is collecting metrics
□ Grafana dashboards are created
□ Alerts are configured
□ Log aggregation is setup
□ Health checks are passing

DATA
□ Database schema is optimized
□ Indexes are created
□ Retention policies are set
□ Compression is enabled
□ Backups are automated

DOCUMENTATION
□ Runbook created for operators
□ Architecture diagram updated
□ API documentation complete
□ Deployment procedures documented
□ Incident response plan ready
```

**Status**: ✅ Mark TODO [15] as complete

---

## 📅 Recommended Timeline

| Phase | Time | Priority |
|-------|------|----------|
| Phase 1 (Validation) | 2-3h | 🔴 CRITICAL - Do today |
| Phase 2 (Simulator) | 4-6h | 🟠 HIGH - Do this week |
| Phase 3 (DB Optimization) | 2-3h | 🟠 HIGH - Do this week |
| Phase 4 (Security) | 3-4h | 🟡 MEDIUM - Do next week |
| Phase 5 (Monitoring) | 4-6h | 🟡 MEDIUM - Do next week |
| Phase 6 (Testing) | 6-8h | 🟡 MEDIUM - Do before prod |
| Phase 7 (CI/CD) | 3-4h | 🟢 LOW - Setup anytime |
| Phase 8 (Checklist) | 1-2h | 🔴 CRITICAL - Before going live |

---

## 🎯 Quick Start (Next 2 Hours)

**Do this NOW**:

1. ✅ Send test telemetry via RabbitMQ
2. ✅ Verify data in database
3. ✅ Check frontend dashboard shows real data
4. ✅ Test analytics endpoint returns correct data

If all pass → System is **functionally complete**. 

Then prioritize security (Phase 4) and monitoring (Phase 5) before production.

---

## 📞 Commands for Quick Reference

```bash
# View all pods
kubectl get pods -n invernadero

# Check database
kubectl exec -it pod/timescaledb-6df8496b78-rskkm -n invernadero -- psql -U admin -d invernadero_db

# Check RabbitMQ
kubectl exec -it pod/rabbitmq-5b8bf687c9-j2fts -n invernadero -- rabbitmq-diagnostics ping

# View backend logs
kubectl logs -f deployment/invernadero-backend -n invernadero

# Scale backend
kubectl scale deployment invernadero-backend --replicas=5 -n invernadero

# Restart all services
kubectl rollout restart deployment -n invernadero
```

---

**Current Status**: ✅ Deployed and Functional
**Next Step**: Complete Phase 1 (Validation) today

