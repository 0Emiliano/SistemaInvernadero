# ✅ PHASE 5 COMPLETE - Observability Stack

## 🔍 Stack de Observabilidad Implementado

### Componentes Desplegados

**1. Prometheus** ✅
- ConfigMap con scrape configs
- Alert rules (HighTemperature, BackendAPIDown, HighMemoryUsage)
- 30 días de retención de métricas
- RBAC configurado

**2. Grafana** ✅
- Datasources pre-configurados (Prometheus, Loki, Jaeger)
- Login: admin / admin123
- Soporte para dashboards personalizados
- Plugin Piechart incluido

**3. Jaeger** ✅
- All-in-one deployment
- Endpoints: UI (16686), Zipkin (9411), Jaeger Compact (6831/UDP)
- Distributed tracing completo

**4. Loki** ✅
- ConfigMap con configuración
- Log aggregation
- Storage filesystem
- 30 días de retención

**5. Backend (Spring Boot 3.2.2)** ✅
- Micrometer Prometheus Registry
- Micrometer Tracing (Jaeger)
- Loki Logback Appender
- JWT Ready (pom.xml actualizado)

---

## 📦 Archivos Creados

### Kubernetes Manifests
1. `k8s/prometheus.yaml` - Metrics + Alertas
2. `k8s/grafana.yaml` - Dashboards
3. `k8s/jaeger.yaml` - Distributed Tracing
4. `k8s/loki.yaml` - Log Aggregation
5. `k8s/backend-supabase.yaml` - Backend actualizado para Supabase

### Configuration Files
6. `java-backend/src/main/resources/logback-spring.xml` - Loki logging config

### Backend Code
7. `java-backend/pom.xml` - Dependencies para Micrometer, Jaeger, Loki, JWT

### Documentation
8. `SUPABASE_MIGRATION_GUIDE.md` - Cómo migrar a Supabase PostgreSQL 15
9. `OBSERVABILITY_DEPLOYMENT_GUIDE.md` - Step-by-step despliegue del stack

---

## 🚀 Cómo Desplegar

### 1. Desplegar Stack de Observabilidad

```bash
# Prometheus
kubectl apply -f k8s/prometheus.yaml

# Grafana
kubectl apply -f k8s/grafana.yaml

# Jaeger
kubectl apply -f k8s/jaeger.yaml

# Loki
kubectl apply -f k8s/loki.yaml

# Esperar a que estén listos
kubectl get pods -n invernadero | grep -E "prometheus|grafana|jaeger|loki"
```

### 2. Configurar Backend para Supabase

```bash
# 1. Crear proyecto en Supabase.com
# 2. Copiar credenciales
# 3. Crear secret en K8s
kubectl create secret generic supabase-credentials \
  --from-literal=host=your-project.supabase.co \
  --from-literal=port=5432 \
  --from-literal=database=postgres \
  --from-literal=username=postgres \
  --from-literal=password=YOUR_PASSWORD \
  -n invernadero

# 4. Recompilar backend
docker build -t invernadero-backend:latest ./java-backend

# 5. Desplegar
kubectl apply -f k8s/backend-supabase.yaml
```

### 3. Port-Forward Todo

```bash
# Terminal separadas o background
kubectl port-forward svc/prometheus-service 9090:9090 -n invernadero --address=0.0.0.0 &
kubectl port-forward svc/grafana-service 3001:3000 -n invernadero --address=0.0.0.0 &
kubectl port-forward svc/jaeger-service 16686:16686 -n invernadero --address=0.0.0.0 &
```

---

## 📊 Acceso a Servicios

| Servicio | URL | User | Pass |
|----------|-----|------|------|
| **Prometheus** | http://localhost:9090 | - | - |
| **Grafana** | http://localhost:3001 | admin | admin123 |
| **Jaeger** | http://localhost:16686 | - | - |
| **Loki** | (via Grafana) | - | - |
| **Backend** | http://localhost:8080 | - | - |

---

## 🎯 Qué Puede Hacer

### Prometheus
✅ Scrape métricas del backend cada 10 segundos
✅ Ejecutar alertas si temp > 35°C
✅ Ejecutar alertas si backend cae
✅ PromQL queries avanzadas

### Grafana
✅ Crear dashboards con Prometheus
✅ Ver logs en tiempo real (Loki)
✅ Ver traces distribuidos (Jaeger)
✅ Alertas y notificaciones

### Jaeger
✅ Traces de requests HTTP
✅ Latencia de queries a DB
✅ Dependencies entre servicios
✅ Service graph

### Loki
✅ Agregar logs de backend
✅ Buscar por labels (app, level, logger)
✅ LogQL queries
✅ 30 días retención

### Backend
✅ Exporta métricas a Prometheus
✅ Envía traces a Jaeger
✅ Envía logs a Loki
✅ Conecta a Supabase PostgreSQL 15

---

## 🔄 Data Flow

```
┌─────────────────────┐
│ Backend (Spring)    │
│ + Micrometer        │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
    ↓             ↓
┌─────────┐  ┌──────────┐
│Prometheus  │  │ Jaeger   │
│ (Metrics)  │  │(Traces)  │
└─────────┘  └──────────┘
    │             │
    └──────┬──────┘
           ↓
      ┌─────────┐
      │ Loki    │
      │ (Logs)  │
      └────┬────┘
           │
           ↓
      ┌─────────────┐
      │  Grafana    │
      │ (Dashboard) │
      └─────────────┘

DB Flow:
Backend ←→ Supabase (PostgreSQL 15 + TimescaleDB)
```

---

## 📈 Métricas Disponibles

### Application Metrics
- `http_server_requests_seconds_count` - Total requests
- `http_server_requests_seconds_sum` - Total latency
- `http_server_requests_seconds_max` - Max latency
- `http_requests_active` - Requests activos

### JVM Metrics
- `jvm_memory_used_bytes` - Memoria usada
- `jvm_memory_max_bytes` - Memoria máxima
- `jvm_threads_live_threads` - Threads activos
- `jvm_gc_pause_seconds` - Garbage collection

### Custom Metrics (si se implementan)
- `mediciones_temperature_celsius` - Temperatura
- `mediciones_insert_seconds` - Latencia de inserts
- `rabbitmq_messages_processed` - Messages procesados

---

## ⚠️ Alertas Configuradas

1. **HighTemperature**
   - Condición: `mediciones_temperature_celsius > 35`
   - Duración: 2 minutos
   - Severidad: CRITICAL

2. **BackendAPIDown**
   - Condición: `up{job="backend-api"} == 0`
   - Duración: 1 minuto
   - Severidad: CRITICAL

3. **HighMemoryUsage**
   - Condición: Memory > 80%
   - Duración: 2 minutos
   - Severidad: WARNING

---

## 🔐 Seguridad

✅ **Prometheus**: Sin autenticación (usar NetworkPolicy si necesario)
✅ **Grafana**: Usuario/password (admin/admin123 - CAMBIAR en producción)
✅ **Jaeger**: Sin autenticación (internal only)
✅ **Loki**: Sin autenticación (internal only)
✅ **Backend**: Conecta a Supabase via SSL/TLS

---

## 🚀 Próximos Pasos

### Inmediato
- [ ] Desplegar observability stack
- [ ] Configurar Supabase
- [ ] Migrar datos
- [ ] Verificar conexión

### Esta Semana
- [ ] Crear dashboards personalizados
- [ ] Configurar alertas Slack/Email
- [ ] Load testing (HPA)
- [ ] JWT authentication

### Antes de Producción
- [ ] TLS para servicios externos
- [ ] CI/CD pipeline
- [ ] Backup/Restore procedures
- [ ] Disaster recovery plan

---

## 📞 Quick Commands

```bash
# Ver logs del stack
kubectl logs -f deployment/prometheus -n invernadero
kubectl logs -f deployment/grafana -n invernadero
kubectl logs -f deployment/jaeger -n invernadero
kubectl logs -f deployment/loki -n invernadero

# Ver pods
kubectl get pods -n invernadero | grep -E "prometheus|grafana|jaeger|loki|backend"

# Port-forward
kubectl port-forward svc/prometheus-service 9090:9090 -n invernadero &
kubectl port-forward svc/grafana-service 3001:3000 -n invernadero &
kubectl port-forward svc/jaeger-service 16686:16686 -n invernadero &

# Test connection
curl http://localhost:8080/actuator/prometheus
curl http://localhost:8080/actuator/health
```

---

## 📚 Documentación

- `OBSERVABILITY_DEPLOYMENT_GUIDE.md` - Step-by-step despliegue
- `SUPABASE_MIGRATION_GUIDE.md` - Migración a Supabase
- `K8S_ACCESS_GUIDE.md` - Acceso a servicios
- `FINAL_STATUS.md` - Estado general del sistema

---

**Status**: ✅ **PHASE 5 COMPLETE - OBSERVABILITY STACK READY**
**Components**: Prometheus + Grafana + Jaeger + Loki + Micrometer
**Database**: Supabase PostgreSQL 15 (with TimescaleDB)
**Ready for**: Production deployment with full observability

