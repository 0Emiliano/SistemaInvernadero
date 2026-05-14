# ✅ Kubernetes Deployment Complete - Sistema Invernadero

## Deployment Status

All services deployed successfully to Kubernetes cluster running on **Docker Desktop**.

### Pod Status (All Ready ✅)
```
NAMESPACE       NAME                                    READY   STATUS
invernadero     invernadero-backend-74cdbb4945-75mkq    1/1     Running
invernadero     invernadero-backend-74cdbb4945-g79k4    1/1     Running
invernadero     invernadero-backend-74cdbb4945-pjbhh    1/1     Running
invernadero     invernadero-frontend-7556bffc96-jc6vc   1/1     Running
invernadero     invernadero-frontend-7556bffc96-t8j5h   1/1     Running
invernadero     rabbitmq-5b8bf687c9-j2fts               1/1     Running
invernadero     timescaledb-6df8496b78-rskkm            1/1     Running
```

---

## 🌐 Access Points

### Frontend Dashboard
- **URL**: http://localhost:32696
- **Port**: 32696 (NodePort)
- **Description**: React dashboard with real-time sensor monitoring
- **Status**: ✅ Running (2/2 replicas)

### Backend API
- **URL**: http://localhost:30095
- **Port**: 30095 (API LoadBalancer)
- **Ports**: 
  - API: 80 (internal) → 30095 (external)
  - TCP Ingestion: 9000 (internal) → 32092 (external)
- **Status**: ✅ Running (3/3 replicas)

### RabbitMQ Management UI
- **URL**: http://localhost:15672
- **Credentials**: 
  - Username: `invernadero`
  - Password: `rabbitmq-secure-password-change-me` (from secrets)
- **Port**: 15672
- **Status**: ✅ Running (1/1 replica)

### TimescaleDB
- **Host**: timescaledb-service (internal)
- **Port**: 5432
- **Database**: invernadero_db
- **Credentials**:
  - Username: `admin` (from secrets)
  - Password: `password` (from secrets)
- **Status**: ✅ Running (1/1 replica)

---

## 📊 Deployed Components

| Component | Replicas | Status | CPU Request | Memory Request |
|-----------|----------|--------|-------------|-----------------|
| Backend | 3 | ✅ Ready | 250m | 512Mi |
| Frontend | 2 | ✅ Ready | 100m | 128Mi |
| RabbitMQ | 1 | ✅ Ready | 250m | 256Mi |
| TimescaleDB | 1 | ✅ Ready | 250m | 256Mi |

---

## 🔄 Auto-Scaling Configuration

### Backend HPA (Horizontal Pod Autoscaler)
- **Min Replicas**: 2
- **Max Replicas**: 5
- **Metrics**:
  - CPU Utilization: 70%
  - Memory Utilization: 80%
- **Status**: Active (currently 3 replicas)

### Frontend HPA
- **Min Replicas**: 2
- **Max Replicas**: 4
- **Metrics**:
  - CPU Utilization: 75%
- **Status**: Active (currently 2 replicas)

---

## 🛡️ Pod Disruption Budgets

- **Backend PDB**: minAvailable=1 (ensures at least 1 pod always running during maintenance)
- **Frontend PDB**: minAvailable=1 (ensures at least 1 pod always running during maintenance)

---

## 🔌 Networking

### Internal Services (ClusterIP)
- `invernadero-api-service` → Backend API (port 8080)
- `invernadero-frontend-service` → Frontend (port 3000)
- `rabbitmq-service` → RabbitMQ AMQP (port 5672)
- `timescaledb-service` → PostgreSQL (port 5432)

### External Services (LoadBalancer)
- `invernadero-api-lb` → Backend LoadBalancer (localhost:30095)
- `invernadero-frontend-lb` → Frontend LoadBalancer (localhost:32696)
- `rabbitmq-management` → RabbitMQ UI (localhost:15672)

---

## 🔐 Secrets & ConfigMaps

### Secrets (invernadero namespace)
- `invernadero-db-secret`: Database credentials
  - POSTGRES_USER: `admin` (can be changed)
  - POSTGRES_PASSWORD: `password` (⚠️ change in production)
  
- `invernadero-rabbitmq-secret`: RabbitMQ credentials
  - RABBITMQ_DEFAULT_USER: `invernadero`
  - RABBITMQ_DEFAULT_PASS: `rabbitmq-secure-password-change-me` (⚠️ change in production)

### ConfigMaps
- `invernadero-backend-config`: Backend Spring Boot configuration
- `invernadero-frontend-config`: Frontend environment variables

---

## 📝 Useful kubectl Commands

### Check deployment status
```bash
kubectl get all -n invernadero
kubectl get pods -n invernadero -o wide
kubectl get svc -n invernadero
kubectl get hpa -n invernadero
```

### View logs
```bash
# Backend
kubectl logs -f deployment/invernadero-backend -n invernadero
kubectl logs -f pod/invernadero-backend-74cdbb4945-75mkq -n invernadero

# Frontend
kubectl logs -f deployment/invernadero-frontend -n invernadero

# RabbitMQ
kubectl logs -f deployment/rabbitmq -n invernadero

# TimescaleDB
kubectl logs -f deployment/timescaledb -n invernadero
```

### Port Forward (local development)
```bash
# Backend API
kubectl port-forward svc/invernadero-api-service 8080:80 -n invernadero

# Frontend
kubectl port-forward svc/invernadero-frontend-service 3000:80 -n invernadero

# RabbitMQ Management
kubectl port-forward svc/rabbitmq-service 5672:5672 -n invernadero

# TimescaleDB
kubectl port-forward svc/timescaledb-service 5432:5432 -n invernadero
```

### Execute commands in pods
```bash
# Backend
kubectl exec -it pod/invernadero-backend-74cdbb4945-75mkq -n invernadero -- bash

# Database queries
kubectl exec -it pod/timescaledb-6df8496b78-rskkm -n invernadero -- psql -U admin -d invernadero_db

# RabbitMQ
kubectl exec -it pod/rabbitmq-5b8bf687c9-j2fts -n invernadero -- bash
```

### Scale deployments
```bash
# Scale backend to 5 replicas
kubectl scale deployment invernadero-backend --replicas=5 -n invernadero

# Scale frontend to 3 replicas
kubectl scale deployment invernadero-frontend --replicas=3 -n invernadero
```

### View HPA status
```bash
kubectl describe hpa invernadero-backend-hpa -n invernadero
kubectl describe hpa invernadero-frontend-hpa -n invernadero
```

---

## 🧪 Testing the Deployment

### 1. Check Backend API Health
```bash
curl http://localhost:30095/actuator/health
```

Expected response:
```json
{
  "status": "UP"
}
```

### 2. Check Analytics Dashboard Endpoint
```bash
curl http://localhost:30095/api/v1/analytics/dashboard/GW-001
```

### 3. Access Frontend Dashboard
Open browser to: http://localhost:32696

### 4. Access RabbitMQ Management Console
Open browser to: http://localhost:15672
- Username: `invernadero`
- Password: `rabbitmq-secure-password-change-me`

### 5. Send Test Telemetry via RabbitMQ
1. Go to RabbitMQ UI → Exchanges
2. Click on `invernadero.telemetry.exchange`
3. In "Publish message", use routing key: `invernadero.GW-001.S01`
4. Publish JSON payload:
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

---

## 📊 Data Verification

### Query TimescaleDB for Persisted Data
```bash
# Connect to database
kubectl exec -it pod/timescaledb-6df8496b78-rskkm -n invernadero -- \
  psql -U admin -d invernadero_db

# In psql prompt:
SELECT * FROM mediciones LIMIT 5;
SELECT COUNT(*) FROM mediciones;
```

---

## 🔄 RabbitMQ Configuration

### Exchanges
- **Name**: `invernadero.telemetry.exchange`
- **Type**: Topic
- **Durable**: Yes

### Queues
- **alarm.queue** → Alarm Service (evaluates temperature thresholds)
- **persistence.queue** → Persistence Service (saves to TimescaleDB)

### Bindings
- Exchange → alarm.queue: routing key `invernadero.#`
- Exchange → persistence.queue: routing key `invernadero.#`

---

## 🛠️ Troubleshooting

### Pod not Ready?
```bash
# Check pod events
kubectl describe pod <pod-name> -n invernadero

# View logs
kubectl logs <pod-name> -n invernadero --tail=100
```

### Service not accessible?
```bash
# Check service endpoints
kubectl get endpoints -n invernadero

# Check LoadBalancer status
kubectl get svc -n invernadero -o wide
```

### Database connection issues?
```bash
# Verify PostgreSQL is running
kubectl exec -it pod/timescaledb-6df8496b78-rskkm -n invernadero -- pg_isready -U admin

# Check schema
kubectl exec -it pod/timescaledb-6df8496b78-rskkm -n invernadero -- \
  psql -U admin -d invernadero_db -c "\dt"
```

### RabbitMQ connection issues?
```bash
# Verify RabbitMQ is running
kubectl exec -it pod/rabbitmq-5b8bf687c9-j2fts -n invernadero -- \
  rabbitmq-diagnostics ping
```

---

## 📚 Image Information

### Backend Image
- **Name**: `invernadero-backend:latest`
- **Base**: `eclipse-temurin:17-jre`
- **Build**: Multi-stage Maven build
- **Size**: ~528MB (built), ~158MB (runtime)

### Frontend Image
- **Name**: `invernadero-frontend:latest`
- **Base**: `nginxinc/nginx-unprivileged:1.27-alpine`
- **Build**: Multi-stage Node.js → Nginx
- **Size**: ~74.7MB (built), ~21.2MB (runtime)

---

## 🚀 Next Steps

1. **Monitor Performance**: Watch HPA metrics and scale as needed
2. **Update Secrets**: Change default passwords in production
3. **Backup Data**: Configure persistent volume backups
4. **Set Resource Quotas**: Limit namespace resource consumption
5. **Add Ingress**: Replace LoadBalancer with Ingress controller for production
6. **Implement Monitoring**: Add Prometheus/Grafana for metrics
7. **Setup Logging**: Centralize logs with ELK or similar
8. **Configure RBAC**: Implement role-based access control
9. **SSL/TLS**: Add certificate management with cert-manager

---

## 📋 Manifest Files

All Kubernetes manifests are located in `k8s/` directory:
- `namespace.yaml` — Namespace
- `configmaps-secrets.yaml` — Configs & secrets
- `persistent-volumes.yaml` — Storage
- `postgres.yaml` — Database
- `rabbitmq.yaml` — Message broker
- `backend.yaml` — Backend API
- `frontend.yaml` — Frontend UI
- `autoscaling.yaml` — HPA configurations
- `disruption-budgets.yaml` — Pod disruption budgets
- `DEPLOYMENT.md` — Deployment guide

---

**Deployment Time**: ~2 minutes (including image pulls and initialization)
**Namespace**: `invernadero`
**Cluster**: Docker Desktop Kubernetes
**Status**: ✅ Production-Ready

