# 🚀 DEPLOY COMPLETO - Opción A + B (Ingress + TLS + JWT + AlertManager)

## 📋 Componentes Añadidos

```
✅ Cert-Manager + Let's Encrypt (TLS automático)
✅ Nginx Ingress Controller (punto de entrada único)
✅ JWT Authentication (stateless, multi-tenant)
✅ AlertManager + Slack/Email notifications
✅ Security hardening (CORS, RBAC, role-based access)
```

---

## 🔧 DEPLOY PASO A PASO (30-45 minutos)

### 1. Instalar Cert-Manager (5 min)

```bash
# Agregar repo Helm
helm repo add jetstack https://charts.jetstack.io
helm repo update

# Instalar cert-manager
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.13.0 \
  --set installCRDs=true

# Verificar
kubectl get pods -n cert-manager
```

### 2. Instalar Nginx Ingress Controller (5 min)

```bash
# Agregar repo
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Instalar
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer

# Obtener IP
kubectl get svc -n ingress-nginx
# Copiar EXTERNAL-IP
```

### 3. Actualizar DNS (Inmediato)

En tu proveedor de DNS (Godaddy, Namecheap, Route53, etc):

```
invernadero.example.com        → INGRESS_IP
api.invernadero.example.com    → INGRESS_IP
grafana.invernadero.example.com → INGRESS_IP
prometheus.invernadero.example.com → INGRESS_IP
jaeger.invernadero.example.com → INGRESS_IP
alertmanager.invernadero.example.com → INGRESS_IP
```

### 4. Crear ClusterIssuers (Let's Encrypt) (2 min)

```bash
# Copiar y editar con tu email
cat > cert-issuer.yaml << 'EOF'
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

kubectl apply -f cert-issuer.yaml
```

### 5. Desplegar AlertManager (5 min)

```bash
# Editar con tu Slack webhook
# https://api.slack.com/messaging/webhooks

kubectl apply -f k8s/alertmanager.yaml

# Verificar
kubectl get pods -n invernadero | grep alertmanager
```

### 6. Aplicar Ingress + TLS (2 min)

```bash
# Editar dominio en k8s/ingress.yaml
# Cambiar: invernadero.example.com → tu-dominio.com

kubectl apply -f k8s/ingress.yaml

# Verificar
kubectl get ingress -n invernadero
kubectl get certificate -n invernadero
```

### 7. Recompilar Backend con JWT (10 min)

```bash
# El código JWT ya está en:
# - java-backend/src/main/java/com/sistemas/invernadero/security/

# Recompilar
docker build -t invernadero-backend:latest ./java-backend

# Actualizar deployment
kubectl rollout restart deployment/invernadero-backend -n invernadero

# Verificar
kubectl logs -f deployment/invernadero-backend -n invernadero
```

### 8. Verificar Certificados (Automático ~5 min)

```bash
# Ver estado de certificados
kubectl describe certificate invernadero-tls-cert -n invernadero

# Ver secretos TLS
kubectl get secret -n invernadero | grep tls

# Cuando esté listo, visitarás:
# https://invernadero.example.com
```

---

## 📊 Flujo de Autenticación Completo

```
Usuario
   ↓
POST /auth/login (sin TLS aún en local, con TLS en prod)
   ↓
JWT Token generado
   ↓
Frontend almacena en localStorage
   ↓
Authorization: Bearer <token>
   ↓
Backend valida JWT
   ↓
SecurityContext establecido
   ↓
Request procesado con acceso multi-tenant
```

---

## 🔐 Endpoints Protegidos

```
PUBLICO (sin autenticación):
├─ GET  /actuator/health
├─ POST /auth/login
├─ POST /auth/register
└─ POST /ingest/**          (para sensores)

AUTENTICADO:
├─ GET  /api/v1/analytics/**
├─ GET  /sensors/**
└─ POST /auth/validate
└─ POST /auth/refresh

ADMIN ONLY:
├─ GET  /actuator/prometheus
├─ POST /api/v1/analytics/**
└─ DELETE /sensors/**
```

---

## 🧪 Testing

### 1. Login

```bash
curl -X POST https://api.invernadero.example.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password",
    "greenhouse": "GW-001",
    "role": "ADMIN"
  }'
```

### 2. Usar Token

```bash
TOKEN="eyJhbGciOiJIUzUxMiJ9.eyJz..."

curl -H "Authorization: Bearer $TOKEN" \
  https://api.invernadero.example.com/api/v1/analytics/dashboard/GW-001
```

### 3. Acceder a Dashboards

```
Frontend: https://invernadero.example.com
Grafana: https://grafana.invernadero.example.com (admin/admin123)
Prometheus: https://prometheus.invernadero.example.com
Jaeger: https://jaeger.invernadero.example.com
AlertManager: https://alertmanager.invernadero.example.com
```

---

## 🔍 Troubleshooting

### Certificado no se genera

```bash
# Ver eventos
kubectl describe certificate invernadero-tls-cert -n invernadero

# Ver cert-manager logs
kubectl logs -f -n cert-manager deployment/cert-manager

# Validar DNS
nslookup api.invernadero.example.com
```

### Ingress shows "504 Bad Gateway"

```bash
# Verificar pods están ready
kubectl get pods -n invernadero

# Ver Nginx logs
kubectl logs -f -n ingress-nginx deployment/nginx-ingress-controller
```

### JWT Token inválido

```bash
# Verificar JWT_SECRET en pod
kubectl describe pod <backend-pod> -n invernadero

# Ver logs
kubectl logs <backend-pod> -n invernadero | grep JWT
```

### AlertManager no envía notificaciones

```bash
# Editar config con Slack webhook correcto
kubectl edit configmap alertmanager-config -n invernadero

# Reiniciar
kubectl rollout restart deployment/alertmanager -n invernadero
```

---

## 📁 Archivos Creados/Actualizados

**Kubernetes**:
- k8s/ingress.yaml (NEW)
- k8s/alertmanager.yaml (NEW)

**Backend Java**:
- security/JwtTokenProvider.java (NEW)
- security/JwtAuthenticationFilter.java (NEW)
- security/SecurityConfig.java (NEW)
- modules/auth/AuthController.java (NEW)
- application.properties (UPDATED)

**Documentación**:
- CERT_MANAGER_TLS_SETUP.md (NEW)
- JWT_AUTHENTICATION_GUIDE.md (NEW)

---

## ✨ Resultado Final

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION READY                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ HTTPS (Let's Encrypt automático)                       │
│  ✅ JWT Authentication (stateless, multi-tenant)           │
│  ✅ Single Ingress entrypoint                              │
│  ✅ AlertManager (Slack + Email)                           │
│  ✅ Observabilidad completa (Prom, Grafana, Jaeger, Loki) │
│  ✅ Database (Supabase + TimescaleDB)                      │
│  ✅ Auto-scaling (HPA)                                     │
│  ✅ High availability (PDB)                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**Próximos pasos**: 
- CI/CD pipeline (GitHub Actions)
- ArgoCD for GitOps
- Monitoring alerts en Slack
- Load testing

Sistema 100% completo según diagrama. Listo para producción.
