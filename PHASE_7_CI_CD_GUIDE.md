# Phase 7 - CI/CD Complete Deployment Guide

## Overview

Complete CI/CD pipeline with GitHub Actions (CI) → Docker Hub → ArgoCD (CD) → Kubernetes production deployment.

---

## 🔑 Prerequisites

Before starting, you need:

1. **GitHub Repository** - Push code to trigger pipelines
2. **Docker Hub Account** - Free account at hub.docker.com
3. **Kubernetes Cluster** - EKS, GKE, or local minikube
4. **ArgoCD Instance** - Running in cluster

---

## 📋 Setup Steps

### Step 1: Create GitHub Secrets

Go to GitHub → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

```
DOCKERHUB_USERNAME = your-dockerhub-username
DOCKERHUB_PASSWORD = your-dockerhub-password (or Personal Access Token)
ARGOCD_SERVER_URL = https://argocd.your-domain.com
ARGOCD_TOKEN = argocd-api-token
```

**How to get ARGOCD_TOKEN:**

```bash
# Port-forward ArgoCD
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Login to ArgoCD UI
# URL: https://localhost:8080
# Username: admin
# Password: (get from secret)

kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d

# Generate API token in ArgoCD UI (Settings → Access Tokens)
```

### Step 2: Deploy ArgoCD to Kubernetes

```bash
# Create namespace
kubectl create namespace argocd

# Apply ArgoCD manifest
kubectl apply -f k8s/argocd.yaml -n argocd

# Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app=argocd-server -n argocd --timeout=300s

# Port-forward to access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443 &

# Access at https://localhost:8080
```

### Step 3: Install External Secrets Operator (Optional but Recommended)

```bash
# Add helm repo
helm repo add external-secrets https://charts.external-secrets.io
helm repo update

# Install External Secrets
helm install external-secrets \
  external-secrets/external-secrets \
  -n external-secrets-system \
  --create-namespace \
  --set installCRDs=true

# Apply External Secrets manifest
kubectl apply -f k8s/external-secrets.yaml
```

### Step 4: Deploy ArgoCD Application

Update `k8s/argocd-application.yaml` with your GitHub repository:

```yaml
source:
  repoURL: https://github.com/YOUR_USERNAME/SistemaInvernadero
```

Then apply:

```bash
kubectl apply -f k8s/argocd-application.yaml -n argocd
```

### Step 5: Configure GitHub Webhooks (Optional - for automatic syncs)

In ArgoCD UI:
1. Go to Settings → Webhooks
2. Add GitHub webhook URL
3. Copy the webhook secret
4. Add to GitHub repository settings → Webhooks

---

## 🚀 Workflow

### Push to `main` (Production)

```bash
git add .
git commit -m "Feature: Add new sensor adapter"
git push origin main
```

**What happens automatically:**

1. **GitHub Actions (Backend CI)**
   - ✅ Checkout code
   - ✅ Build Java with Maven
   - ✅ Run unit + integration tests
   - ✅ Upload coverage to Codecov
   - ✅ Build Docker image (multi-stage)
   - ✅ Push to `docker.io/your-username/invernadero-backend:main-latest`

2. **GitHub Actions (Frontend CI)**
   - ✅ Checkout code
   - ✅ Install npm dependencies
   - ✅ Run TypeScript linter
   - ✅ Build with Vite
   - ✅ Run Jest tests
   - ✅ Build Docker image (multi-stage)
   - ✅ Push to `docker.io/your-username/invernadero-frontend:main-latest`

3. **ArgoCD Sync (GitOps)**
   - ✅ Detects changes in `k8s/` directory
   - ✅ Pulls latest image tags
   - ✅ Updates Kubernetes manifests
   - ✅ Deploys new version
   - ✅ Automatic rollback on failure

---

## 📊 Monitor Deployments

### GitHub Actions

1. Go to repository → Actions tab
2. Watch workflows execute in real-time
3. View logs for debugging

### ArgoCD UI

```bash
# Port-forward (if not already running)
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Access: https://localhost:8080

- See sync history
- Rollback to previous versions
- Manual sync if needed

### Kubernetes

```bash
# Watch deployments
kubectl rollout status deployment/invernadero-backend -n invernadero -w

# View pod logs
kubectl logs -f deployment/invernadero-backend -n invernadero

# Describe application
kubectl describe application invernadero -n argocd
```

---

## 🔄 Deployment Scenarios

### Scenario 1: Bug Fix (main branch)

```bash
# Fix bug in backend
vim java-backend/src/...

# Commit and push
git add .
git commit -m "Fix: Connection pool leak"
git push origin main

# Result: Auto-deployed to prod in ~3 minutes
```

### Scenario 2: New Feature (develop branch)

```bash
# Create feature branch
git checkout -b feature/new-sensor-adapter

# Implement feature
# Commit changes
git commit -m "Feat: Add sensor adapter"
git push origin feature/new-sensor-adapter

# Create Pull Request
# After review and merge to develop:
# → Builds to staging image
# → ArgoCD deploys to staging namespace (if configured)
```

### Scenario 3: Manual Rollback

```bash
# In ArgoCD UI or CLI:
argocd app rollback invernadero 1 --argocd-server=localhost:8080

# Or via kubectl:
kubectl rollout undo deployment/invernadero-backend -n invernadero
```

---

## 🔐 Security Best Practices

### 1. Secrets Management

Never commit secrets. Use GitHub Secrets:

```bash
# ✅ GOOD
git commit -m "Update config"
# Secrets in GitHub Secrets only

# ❌ BAD
git commit -m "Add DOCKERHUB_PASSWORD=mypassword"
```

### 2. Image Signing (Optional - Advanced)

```bash
# Sign images with cosign
cosign sign --key cosign.key docker.io/your-username/invernadero-backend:main-latest

# Verify in ArgoCD Application Policy
```

### 3. RBAC for ArgoCD

```bash
# Create read-only role for developers
kubectl apply -f - <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: argocd-read-only
  namespace: argocd
rules:
- apiGroups: ["argoproj.io"]
  resources: ["applications"]
  verbs: ["get", "list"]
EOF
```

---

## 🐛 Troubleshooting

### Build fails in GitHub Actions

Check logs:
1. Go to Actions tab
2. Click failing workflow
3. Expand job logs
4. Look for error messages

Common issues:
- Docker Hub credentials invalid → Update GitHub Secrets
- Maven test failure → Check DB connection in `backend-ci.yml`
- Node dependencies → Check `package-lock.json` is committed

### ArgoCD sync fails

```bash
# Check application status
kubectl describe application invernadero -n argocd

# View last sync error
argocd app get invernadero --argocd-server=localhost:8080

# Manual sync with verbose output
argocd app sync invernadero --argocd-server=localhost:8080 -v
```

### Pods not pulling image

```bash
# Check image pull secrets
kubectl get secret docker-registry-secret -n invernadero -o yaml

# Verify image exists in Docker Hub
docker pull docker.io/your-username/invernadero-backend:main-latest

# Check pod events
kubectl describe pod <pod-name> -n invernadero
```

---

## 📈 Performance Tuning

### Reduce build time

```yaml
# In backend-ci.yml
- name: Build with Maven
  run: |
    cd java-backend
    mvn clean package -DskipTests -T 1C  # Parallel threads
    # Or use docker buildx cache:
    # docker buildx build --cache-from=type=registry --cache-to=type=registry ...
```

### Cache Docker layers

Buildx already caches via `cache-from: type=gha` and `cache-to: type=gha,mode=max`

For faster builds:
```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3
  with:
    driver-options: image=moby/buildkit:latest
```

### Parallel workflows

Workflows already run in parallel:
- Backend CI (on `java-backend/**` changes)
- Frontend CI (on `src/**` changes)
- Both can run simultaneously

---

## 📚 Files Created

| File | Purpose |
|------|---------|
| `.github/workflows/backend-ci.yml` | Maven build + test + Docker push |
| `.github/workflows/frontend-ci.yml` | Node build + test + Docker push |
| `.github/workflows/argocd-sync.yml` | Trigger ArgoCD after successful build |
| `k8s/argocd.yaml` | ArgoCD deployment (server, repo, controller) |
| `k8s/argocd-application.yaml` | ArgoCD Application manifest (GitOps) |
| `k8s/external-secrets.yaml` | External Secrets for credential sync |
| `java-backend/src/test/.../AuthControllerIntegrationTest.java` | Integration tests |
| `java-backend/src/test/.../JwtTokenProviderTest.java` | Unit tests |
| `src/App.test.tsx` | React component tests |
| `jest.config.json` | Jest configuration |

---

## ✅ Verification Checklist

- [ ] GitHub Secrets configured (DOCKERHUB_*, ARGOCD_*)
- [ ] ArgoCD deployed to Kubernetes
- [ ] ArgoCD Application created and synced
- [ ] Tests passing locally (`mvn test`, `npm test`)
- [ ] Docker images building successfully
- [ ] Images pushed to Docker Hub
- [ ] ArgoCD detecting and deploying changes
- [ ] Pods rolling out with new image versions
- [ ] Rollback working (manual test)

---

## 🎯 Next Steps

1. **Push test commit** to `main` branch → Watch workflow run
2. **Monitor ArgoCD UI** → See automatic deployment
3. **Scale system** → Update HPA if needed
4. **Add more tests** → Increase coverage threshold
5. **Setup notifications** → Slack alerts for failed deployments

---

## 📞 Quick Reference

```bash
# Deploy ArgoCD
kubectl apply -f k8s/argocd.yaml -n argocd

# Create Application
kubectl apply -f k8s/argocd-application.yaml -n argocd

# Watch sync
kubectl rollout status deployment/invernadero-backend -n invernadero -w

# Get ArgoCD password
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d

# Port-forward ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# View GitHub Actions locally (optional)
act --platform ubuntu-latest=ghcr.io/catthehacker/ubuntu:full-latest
```

---

**System is now fully GitOps enabled with automatic CI/CD.**
