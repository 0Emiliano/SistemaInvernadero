# Kubernetes Deployment - Sistema Invernadero

This folder contains Kubernetes manifests aligned with the current project architecture:

- React/Vite frontend served by Nginx.
- Spring Boot backend on port `8080`.
- TCP ingestion on port `9000`.
- RabbitMQ for telemetry events.
- TimescaleDB for time-series persistence.

## Files

Apply order:

```text
namespace.yaml
configmaps-secrets.yaml
persistent-volumes.yaml
postgres.yaml
rabbitmq.yaml
backend.yaml
frontend.yaml
autoscaling.yaml
disruption-budgets.yaml
```

> Note: `postgres.yaml` deploys TimescaleDB (`timescale/timescaledb:latest-pg15`). The filename is kept for compatibility with the generated file set, but the runtime database is TimescaleDB, not plain PostgreSQL.

## Before deploying

Update image references:

```text
k8s/backend.yaml   -> gcr.io/invernadero-pro/backend:latest
k8s/frontend.yaml  -> gcr.io/invernadero-pro/frontend:latest
```

Replace them with your real registry URLs.

Change default passwords in:

```text
k8s/configmaps-secrets.yaml
```

Current placeholder credentials are intentionally not production-ready.

## Build images

From the repository root, build the frontend image:

```bash
docker build -t your-registry/sistema-invernadero-frontend:latest .
```

From `java-backend`, build the backend image:

```bash
cd java-backend
docker build -t your-registry/sistema-invernadero-backend:latest .
```

Push both images to your registry and update `backend.yaml` and `frontend.yaml`.

## Deploy

Create namespace:

```bash
kubectl apply -f k8s/namespace.yaml
```

Apply configuration and storage:

```bash
kubectl apply -f k8s/configmaps-secrets.yaml
kubectl apply -f k8s/persistent-volumes.yaml
```

Deploy infrastructure:

```bash
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/rabbitmq.yaml
```

Wait for infrastructure:

```bash
kubectl wait --for=condition=ready pod -l app=timescaledb -n invernadero --timeout=300s
kubectl wait --for=condition=ready pod -l app=rabbitmq -n invernadero --timeout=300s
```

Deploy applications:

```bash
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
```

Enable production controls:

```bash
kubectl apply -f k8s/autoscaling.yaml
kubectl apply -f k8s/disruption-budgets.yaml
```

Or apply all manifests:

```bash
kubectl apply -f k8s/
```

## Verify

Check resources:

```bash
kubectl get all -n invernadero
kubectl get pvc -n invernadero
kubectl get hpa -n invernadero
```

Check logs:

```bash
kubectl logs -f deployment/timescaledb -n invernadero
kubectl logs -f deployment/rabbitmq -n invernadero
kubectl logs -f deployment/invernadero-backend -n invernadero
kubectl logs -f deployment/invernadero-frontend -n invernadero
```

Check backend health:

```bash
kubectl exec -it deployment/invernadero-backend -n invernadero -- \
  wget -qO- http://localhost:8080/actuator/health
```

Check frontend:

```bash
kubectl exec -it deployment/invernadero-frontend -n invernadero -- \
  wget -qO- http://localhost:8080/
```

## Access

Frontend LoadBalancer:

```bash
kubectl get svc invernadero-frontend-lb -n invernadero
```

Backend LoadBalancer:

```bash
kubectl get svc invernadero-api-lb -n invernadero
```

RabbitMQ Management:

```bash
kubectl get svc rabbitmq-management -n invernadero
```

RabbitMQ UI:

```text
http://<RABBITMQ_EXTERNAL_IP>:15672
```

## Runtime wiring

Frontend:

- Nginx serves static Vite assets on port `8080`.
- Nginx proxies `/api/` to `http://invernadero-api-service`.

Backend:

- Runs on port `8080`.
- Exposes TCP ingestion on `9000`.
- Uses `SPRING_APPLICATION_JSON` for Kubernetes runtime config.
- Receives database credentials from `invernadero-db-secret`.
- Receives RabbitMQ credentials from `invernadero-rabbitmq-secret`.

TimescaleDB:

- Service: `timescaledb-service`.
- Database: `invernadero_db`.
- PVC: `timescaledb-pvc` with `10Gi`.

RabbitMQ:

- Service: `rabbitmq-service`.
- Management LoadBalancer: `rabbitmq-management`.
- PVC: `rabbitmq-pvc` with `5Gi`.

## Known limitations before production

- Image registry URLs are placeholders.
- Secrets use placeholder values and must be changed.
- No ingress manifest is included yet.
- No TLS/cert-manager configuration is included yet.
- No backup/restore strategy is included for TimescaleDB.
- End-to-end Kubernetes deployment has not been validated against a live cluster in this repository session.

## Cleanup

```bash
kubectl delete namespace invernadero
```

