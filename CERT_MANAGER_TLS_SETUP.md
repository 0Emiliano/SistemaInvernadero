# Cert-Manager + Let's Encrypt para TLS Automático

## Paso 1: Instalar Cert-Manager

```bash
# Agregar helm repo
helm repo add jetstack https://charts.jetstack.io
helm repo update

# Instalar cert-manager
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.13.0 \
  --set installCRDs=true

# Verificar instalación
kubectl get pods --namespace cert-manager
```

## Paso 2: Crear ClusterIssuer (Let's Encrypt)

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com  # CAMBIAR
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx

---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: your-email@example.com  # CAMBIAR
    privateKeySecretRef:
      name: letsencrypt-staging
    solvers:
    - http01:
        ingress:
          class: nginx
```

## Paso 3: Crear Ingress con TLS

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: invernadero-ingress
  namespace: invernadero
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/cors-allow-origin: "*"
    nginx.ingress.kubernetes.io/cors-allow-credentials: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - your-domain.com
    - api.your-domain.com
    - grafana.your-domain.com
    - prometheus.your-domain.com
    - jaeger.your-domain.com
    secretName: invernadero-tls-cert
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: invernadero-frontend-service
            port:
              number: 80
  - host: api.your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: invernadero-api-service
            port:
              number: 80
  - host: grafana.your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: grafana-service
            port:
              number: 3000
  - host: prometheus.your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: prometheus-service
            port:
              number: 9090
  - host: jaeger.your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: jaeger-service
            port:
              number: 16686
```

## Paso 4: Instalar Nginx Ingress Controller

```bash
# Agregar helm repo
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Instalar
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer
```

## Verificación

```bash
# Ver certificados
kubectl get certificate -n invernadero

# Ver secretos TLS
kubectl get secret -n invernadero | grep tls

# Ver Ingress
kubectl describe ingress invernadero-ingress -n invernadero

# Ver cert-manager logs
kubectl logs -f -n cert-manager deployment/cert-manager
```

## DNS Mapping

En tu proveedor de DNS, apunta:
```
your-domain.com        → INGRESS_LOAD_BALANCER_IP
api.your-domain.com    → INGRESS_LOAD_BALANCER_IP
grafana.your-domain.com → INGRESS_LOAD_BALANCER_IP
prometheus.your-domain.com → INGRESS_LOAD_BALANCER_IP
jaeger.your-domain.com → INGRESS_LOAD_BALANCER_IP
```

Obtén el IP con:
```bash
kubectl get svc -n ingress-nginx
# Busca LoadBalancer EXTERNAL-IP
```

---

Este setup proporciona:
✅ SSL/TLS automático via Let's Encrypt
✅ Certificados renovados automáticamente
✅ Un único punto de entrada (Ingress)
✅ Redirección HTTP → HTTPS
✅ CORS habilitado
