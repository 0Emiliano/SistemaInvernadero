# 🔍 Stack de Observabilidad Completo - Despliegue Kubernetes

## Componentes del Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    OBSERVABILIDAD                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Prometheus  │  │   Grafana    │  │    Jaeger    │    │
│  │   (Metrics)  │  │ (Dashboard)  │  │  (Tracing)   │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                  │             │
│  ┌──────────────────┬─────────────────────┬──────────┐    │
│  │                  │                     │          │    │
│  │            ┌─────────────┐             │          │    │
│  │            │    Loki     │             │          │    │
│  │            │ (Logs)      │             │          │    │
│  │            └─────┬───────┘             │          │    │
│  │                  │                     │          │    │
│  └──────┬───────────┼─────────────────────┼──────────┘    │
│         │           │                     │               │
│  ┌──────────────────────────────────────────────┐         │
│  │  Backend (Spring Boot 3.2.2 + Micrometer)   │         │
│  │  - Metrics export (Prometheus)              │         │
│  │  - Tracing (Jaeger/Zipkin)                  │         │
│  │  - Logs (Loki)                              │         │
│  └─────────────────┬──────────────────────────┘         │
│                    │                                      │
│  ┌──────────────────────────────────┐                   │
│  │  Supabase (PostgreSQL 15)        │                   │
│  │  - TimescaleDB para series tiempo│                   │
│  │  - Row Level Security (RLS)      │                   │
│  │  - Backups automaticos           │                   │
│  └──────────────────────────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Paso 1: Crear Namespace y Secrets

```bash
# Ya existe pero confirmar
kubectl get namespace invernadero

# Crear secreto de Supabase (REEMPLAZAR CON TUS VALORES)
kubectl create secret generic supabase-credentials \
  --from-literal=host=your-project.supabase.co \
  --from-literal=port=5432 \
  --from-literal=database=postgres \
  --from-literal=username=postgres \
  --from-literal=password=YOUR_SECURE_PASSWORD \
  -n invernadero

# Verificar
kubectl get secret supabase-credentials -n invernadero -o yaml
```

## Paso 2: Desplegar Prometheus

```bash
# Aplicar manifest de Prometheus (metrics + alertas)
kubectl apply -f k8s/prometheus.yaml

# Verificar deployment
kubectl get pods -n invernadero | grep prometheus
kubectl get svc -n invernadero | grep prometheus

# Acceder a Prometheus
# http://localhost:9090 (después de port-forward)
kubectl port-forward svc/prometheus-service 9090:9090 -n invernadero --address=0.0.0.0
```

### Verificar métricas

```bash
# En Prometheus UI
# 1. Status → Targets (buscar backend-api)
# 2. Graph → Buscar "http_server_requests_seconds_count"
# 3. Ver gráficos en tiempo real
```

## Paso 3: Desplegar Grafana

```bash
# Aplicar manifest de Grafana (dashboards)
kubectl apply -f k8s/grafana.yaml

# Verificar deployment
kubectl get pods -n invernadero | grep grafana
kubectl get svc -n invernadero | grep grafana-service

# Acceder a Grafana
# http://localhost:3000
# Usuario: admin
# Password: admin123
kubectl port-forward svc/grafana-service 3000:3000 -n invernadero --address=0.0.0.0
```

### Agregar datasources en Grafana

1. **Prometheus**:
   - Settings → Data Sources → Add Prometheus
   - URL: http://prometheus-service:9090
   - Save & Test

2. **Loki**:
   - Settings → Data Sources → Add Loki
   - URL: http://loki-service:3100
   - Save & Test

3. **Jaeger**:
   - Settings → Data Sources → Add Jaeger
   - URL: http://jaeger-service:16686
   - Save & Test

## Paso 4: Desplegar Jaeger (Distributed Tracing)

```bash
# Aplicar manifest de Jaeger
kubectl apply -f k8s/jaeger.yaml

# Verificar deployment
kubectl get pods -n invernadero | grep jaeger
kubectl get svc -n invernadero | grep jaeger-service

# Acceder a Jaeger UI
# http://localhost:16686
kubectl port-forward svc/jaeger-service 16686:16686 -n invernadero --address=0.0.0.0
```

### Ver traces

1. Service: `sistema-invernadero`
2. Operation: Seleccionar cualquier operación (GET /api/v1/analytics, etc)
3. Find Traces
4. Hacer clic en un trace para ver detalles de latencia

## Paso 5: Desplegar Loki (Log Aggregation)

```bash
# Aplicar manifest de Loki
kubectl apply -f k8s/loki.yaml

# Verificar deployment
kubectl get pods -n invernadero | grep loki
kubectl get svc -n invernadero | grep loki-service

# Loki solo tiene API (sin UI propia), acceder via Grafana
# En Grafana: Explore → Seleccionar datasource Loki
```

### Ver logs en Grafana

1. Grafana → Explore
2. Datasource: Loki
3. Usar LogQL:
   ```
   {app="sistema-invernadero"}
   {app="sistema-invernadero", level="ERROR"}
   {job="backend-api"}
   ```

## Paso 6: Recompilar Backend con Observabilidad

```bash
# Backend ya incluye dependencias de Micrometer, Jaeger, Loki
# Recompilar imagen
docker build -t invernadero-backend:latest ./java-backend

# Verificar que no hay errores
docker run --rm invernadero-backend:latest /bin/bash -c "java -version"
```

## Paso 7: Actualizar Backend Deployment

```bash
# Usar manifest actualizado con Supabase + Observabilidad
kubectl apply -f k8s/backend-supabase.yaml

# Esperar a que pods estén listos
kubectl wait --for=condition=ready pod -l app=invernadero-backend -n invernadero --timeout=300s

# Verificar logs de backend (debe conectar a Supabase y enviar traces)
kubectl logs -f deployment/invernadero-backend -n invernadero
```

## Paso 8: Verificar Observabilidad End-to-End

### 1. Metrics (Prometheus)

```bash
curl http://localhost:8080/actuator/prometheus | head -50
```

Buscar métricas:
- `http_server_requests_seconds_count` - Contador de requests
- `http_server_requests_seconds` - Latencia
- `jvm_memory_used_bytes` - Memoria
- `jvm_threads_live_threads` - Threads

### 2. Tracing (Jaeger)

```bash
# Hacer request al backend
curl http://localhost:8080/api/v1/analytics/dashboard/GW-001

# En Jaeger UI (http://localhost:16686)
# Debe aparecer el trace con:
# - Operación HTTP
# - Query a DB
# - Latencia total
```

### 3. Logs (Loki)

```bash
# Los logs del backend ya están siendo enviados a Loki
# Ver en Grafana → Explore → Loki
# Query: {app="sistema-invernadero"}
```

### 4. Alertas (Prometheus)

```bash
# En Prometheus UI (http://localhost:9090)
# Alerts tab debe mostrar:
# - HighTemperature (si temp > 35°C)
# - BackendAPIDown (si backend cae)
# - HighMemoryUsage (si memoria > 80%)
```

## Port-Forwarding Completo

```bash
# Terminal 1: Prometheus
kubectl port-forward svc/prometheus-service 9090:9090 -n invernadero --address=0.0.0.0

# Terminal 2: Grafana
kubectl port-forward svc/grafana-service 3000:3000 -n invernadero --address=0.0.0.0

# Terminal 3: Jaeger
kubectl port-forward svc/jaeger-service 16686:16686 -n invernadero --address=0.0.0.0

# Terminal 4: Backend API
kubectl port-forward svc/invernadero-api-service 8080:80 -n invernadero --address=0.0.0.0

# Terminal 5: Frontend
kubectl port-forward svc/invernadero-frontend-service 3000:80 -n invernadero --address=0.0.0.0
```

O usar script:

```bash
cat > start-observability.sh << 'EOF'
#!/bin/bash
echo "Starting Observability Stack..."
kubectl port-forward svc/prometheus-service 9090:9090 -n invernadero --address=0.0.0.0 &
kubectl port-forward svc/grafana-service 3001:3000 -n invernadero --address=0.0.0.0 &
kubectl port-forward svc/jaeger-service 16686:16686 -n invernadero --address=0.0.0.0 &
kubectl port-forward svc/invernadero-api-service 8080:80 -n invernadero --address=0.0.0.0 &
kubectl port-forward svc/invernadero-frontend-service 3002:80 -n invernadero --address=0.0.0.0 &
echo "✅ All services forwarded!"
echo "- Prometheus: http://localhost:9090"
echo "- Grafana: http://localhost:3001 (admin/admin123)"
echo "- Jaeger: http://localhost:16686"
echo "- Backend: http://localhost:8080"
echo "- Frontend: http://localhost:3002"
wait
EOF

chmod +x start-observability.sh
./start-observability.sh
```

## Acceso a Servicios

| Servicio | URL | Usuario | Password | Descripción |
|----------|-----|---------|----------|-------------|
| Prometheus | http://localhost:9090 | N/A | N/A | Métricas |
| Grafana | http://localhost:3001 | admin | admin123 | Dashboards |
| Jaeger | http://localhost:16686 | N/A | N/A | Traces distribuidos |
| Loki | (via Grafana) | N/A | N/A | Logs agregados |
| Backend API | http://localhost:8080 | N/A | N/A | REST API |
| Frontend | http://localhost:3002 | N/A | N/A | React Dashboard |

## Dashboards Grafana Recomendados

### 1. Application Metrics
```
Panels:
- Request Rate (requests/sec)
- Response Time (p50, p95, p99)
- Error Rate (%)
- JVM Memory Usage
- Active Threads
```

### 2. Database Performance
```
Panels:
- Query Count
- Query Latency
- Connection Pool Status
- Transaction Rate
```

### 3. Alertas
```
Panels:
- Critical Alerts Count
- Warning Alerts Count
- Alert Trend (últimas 24h)
```

## Configurar Email Alerts (Opcional)

En Prometheus:

```yaml
# k8s/prometheus.yaml - agregar alertmanager
global:
  resolve_timeout: 5m
  slack_api_url: 'YOUR_SLACK_WEBHOOK'

route:
  receiver: 'default'
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h

receivers:
- name: 'default'
  slack_configs:
  - channel: '#alerts'
    title: 'Alert: {{ .GroupLabels.alertname }}'
```

## Troubleshooting

### Prometheus no ve métricas
```
❌ target down
✅ Verificar: kubectl port-forward svc/invernadero-api-service 8080:80
✅ Curl: curl http://localhost:8080/actuator/prometheus
```

### Jaeger no recibe traces
```
❌ No spans
✅ Backend debe tener OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger-service:4317
✅ Revisar logs: kubectl logs deployment/invernadero-backend -n invernadero
```

### Loki no agrega logs
```
❌ No entries
✅ Verificar logback-spring.xml está en classpath
✅ URL Loki correcta: http://loki-service:3100
✅ Revisar logs de loki: kubectl logs deployment/loki -n invernadero
```

## Siguiente: Supabase Migration

Ver `SUPABASE_MIGRATION_GUIDE.md` para migrar TimescaleDB local a Supabase Cloud.

---

**Stack Completo**: ✅ Prometheus + Grafana + Jaeger + Loki + Supabase
**Estado**: Ready for deployment
**Observabilidad**: Production-grade
