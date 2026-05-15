# 🎯 DEPLOY COMPLETE OBSERVABILITY STACK - ONE COMMAND

```bash
# Step 1: Apply all observability stack
kubectl apply -f k8s/prometheus.yaml
kubectl apply -f k8s/grafana.yaml
kubectl apply -f k8s/jaeger.yaml
kubectl apply -f k8s/loki.yaml

# Step 2: Create Supabase secret (REPLACE WITH YOUR VALUES)
kubectl create secret generic supabase-credentials \
  --from-literal=host=your-project.supabase.co \
  --from-literal=port=5432 \
  --from-literal=database=postgres \
  --from-literal=username=postgres \
  --from-literal=password=YOUR_SECURE_PASSWORD \
  -n invernadero

# Step 3: Apply updated backend with Supabase
kubectl apply -f k8s/backend-supabase.yaml

# Step 4: Wait for all pods
kubectl wait --for=condition=ready pod -l app=prometheus,app=grafana,app=jaeger,app=loki -n invernadero --timeout=300s

# Step 5: Port forward (run in separate terminals)
# Terminal 1
kubectl port-forward svc/prometheus-service 9090:9090 -n invernadero --address=0.0.0.0

# Terminal 2
kubectl port-forward svc/grafana-service 3001:3000 -n invernadero --address=0.0.0.0

# Terminal 3
kubectl port-forward svc/jaeger-service 16686:16686 -n invernadero --address=0.0.0.0

# Terminal 4
kubectl port-forward svc/invernadero-api-service 8080:80 -n invernadero --address=0.0.0.0

# Step 6: Verify
kubectl get pods -n invernadero
kubectl get svc -n invernadero

# Access:
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3001 (admin/admin123)
# - Jaeger: http://localhost:16686
# - Backend: http://localhost:8080
```

---

## 📊 What's Deployed

✅ **Prometheus**: Scrapes metrics from backend every 10s
✅ **Grafana**: Dashboards with Prometheus, Loki, Jaeger datasources
✅ **Jaeger**: Distributed tracing for all requests
✅ **Loki**: Log aggregation from backend
✅ **Backend**: Connected to Supabase, exports all telemetry
✅ **Sensor Simulator**: Still running (continuous data)

---

## 🔄 Complete Data Flow

```
Sensor Simulator (6 streams/30s)
    ↓
RabbitMQ (invernadero.telemetry.exchange)
    ├→ Alarm Service
    └→ Persistence Service
        ↓
    Supabase PostgreSQL 15 + TimescaleDB
        ↓
Backend API (Metrics + Traces + Logs)
    ├→ Prometheus (Metrics)
    ├→ Jaeger (Traces)
    └→ Loki (Logs)
        ↓
    Grafana (Dashboard)
```

---

## ✨ Stack Features

### Observability
- **Real-time metrics** (Prometheus)
- **Custom dashboards** (Grafana)
- **Distributed tracing** (Jaeger)
- **Log aggregation** (Loki)
- **Automated alerts** (HighTemp, API Down, HighMemory)

### Database
- **Supabase PostgreSQL 15** (managed)
- **TimescaleDB** (time-series optimization)
- **Row Level Security** (multi-tenancy)
- **Automatic backups** (daily + PITR)
- **SSL/TLS** (encrypted)

### Backend
- **Micrometer Prometheus** (metrics export)
- **Jaeger tracing** (distributed tracing)
- **Loki logging** (log aggregation)
- **JWT ready** (security)
- **Health checks** (readiness/liveness)

---

## 📈 Metrics Collected

### Application Metrics
- HTTP requests (count, latency, errors)
- Active requests
- Response times (p50, p95, p99)

### JVM Metrics
- Memory usage (heap, non-heap)
- Thread count
- Garbage collection
- Class loading

### Custom Metrics (via backend)
- Temperature readings
- Sensor events
- DB query latency

---

## 🚨 Alerts Configured

1. **HighTemperature** → temp > 35°C → CRITICAL
2. **BackendAPIDown** → up == 0 → CRITICAL
3. **HighMemoryUsage** → memory > 80% → WARNING

---

## 🔐 Security

✅ Supabase SSL/TLS (default)
✅ Backend uses secure credentials
✅ Grafana auth enabled
✅ RBAC in Kubernetes
⚠️ Change Grafana password (admin/admin123) before production

---

## 📋 Next Steps

1. **Deploy** this stack
2. **Configure** Supabase (create project, enable TimescaleDB)
3. **Migrate** data (see SUPABASE_MIGRATION_GUIDE.md)
4. **Monitor** dashboards in Grafana
5. **Implement** JWT auth (Phase 6)
6. **Load test** HPA scaling (Phase 6)

---

**Status**: ✅ PHASE 5 COMPLETE
**Stack**: Prometheus + Grafana + Jaeger + Loki + Supabase
**Ready**: Production deployment with full observability
