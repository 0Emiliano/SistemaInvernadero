# Session #5 - CI/CD End-to-End Validation Plan

**Fecha**: May 14, 2026
**Objetivo**: Validar pipeline completo GitHub Actions + ArgoCD + Kubernetes

---

## 🎯 Resumen

En Session #5 validaremos que:
1. ✅ Git push a `main` dispara GitHub Actions
2. ✅ Backend CI compila, testa y pushea imagen a Docker Hub
3. ✅ Frontend CI compila, testa y pushea imagen a Docker Hub
4. ✅ ArgoCD detecta cambios y sincroniza a Kubernetes
5. ✅ Pods se actualizan automáticamente
6. ✅ Sistema sigue operativo post-deployment

**Tiempo estimado**: 45-60 minutos

---

## 📋 Pre-Requisitos Verificados

### ✅ Git Setup
- Repository: https://github.com/0Emiliano/SistemaInvernadero.git
- User: 0Emiliano (emiliano.rascon22@outlook.com)
- Current branch: main
- Remote: origin configured

### ✅ Código Listo
- Todos los workflows definidos: `.github/workflows/*.yml`
- ArgoCD Application manifest: `k8s/argocd-application.yaml`
- Tests implementados: Backend + Frontend
- Manifests K8s listos para deployment

### ⚠️ Configuración Necesaria (REQUIERE SETUP MANUAL)
Tu responsabilidad completar ANTES de Session #5:

**1. Docker Hub Account** (required for image push)
- [ ] Crear account en hub.docker.com (si no tienes)
- [ ] Username: tu-username
- [ ] Personal Access Token: https://hub.docker.com/settings/security

**2. GitHub Secrets** (required for CI/CD)
```
GitHub Repo → Settings → Secrets and variables → Actions
```

Agregar estos 4 secrets:

```yaml
DOCKERHUB_USERNAME: tu-username
DOCKERHUB_PASSWORD: tu-personal-access-token
ARGOCD_SERVER_URL: https://your-argocd.com  # (o localhost:8080 si local)
ARGOCD_TOKEN: your-argocd-api-token
```

**3. Kubernetes Cluster con ArgoCD Deployado**
- [ ] kubectl cluster running (Docker Desktop or remote)
- [ ] ArgoCD deployed: `kubectl apply -f k8s/argocd.yaml -n argocd`
- [ ] ArgoCD accessible: `kubectl port-forward svc/argocd-server -n argocd 8080:443 &`
- [ ] ArgoCD token generated (see below)

---

## 🔧 Setup Paso a Paso

### Step 1: Setup Docker Hub (5 min)

```bash
# 1a. Verify Docker Hub account
# Go to: https://hub.docker.com
# Sign in or create account

# 1b. Create Personal Access Token
# Settings → Security → New Access Token
# Name: "GitHub Actions"
# Copy the token (save somewhere safe)

# 1c. Test locally (optional)
docker login
# Username: your-username
# Password: paste-your-token
# Should see: Login Succeeded
```

### Step 2: Setup GitHub Secrets (5 min)

```bash
# Go to: https://github.com/0Emiliano/SistemaInvernadero
# Settings → Secrets and variables → Actions
# Click "New repository secret"

# Add 4 secrets:
# 1. DOCKERHUB_USERNAME = your-username
# 2. DOCKERHUB_PASSWORD = your-personal-access-token
# 3. ARGOCD_SERVER_URL = https://localhost:8080 (if local)
# 4. ARGOCD_TOKEN = (see Step 3 below)
```

### Step 3: Get ArgoCD Token (10 min)

```bash
# 3a. Deploy ArgoCD (if not already done)
kubectl create namespace argocd
kubectl apply -f k8s/argocd.yaml -n argocd

# 3b. Wait for ArgoCD to be ready
kubectl wait --for=condition=ready pod \
  -l app=argocd-server \
  -n argocd \
  --timeout=300s

# 3c. Port-forward ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443 &
# Access: https://localhost:8080 (ignore certificate warning)

# 3d. Get initial admin password
kubectl get secret argocd-initial-admin-secret -n argocd \
  -o jsonpath="{.data.password}" | base64 -d

# Result: (something like) hB7x9mK2pQr5vL8x

# 3e. Login to ArgoCD UI
# URL: https://localhost:8080
# Username: admin
# Password: (from step 3d)

# 3f. Generate API token
# UI → Settings → Accounts → Generate new token
# Name: "GitHub Actions"
# Copy token (save somewhere safe)

# 3g. Add to GitHub Secrets
# Value: (token from 3f)
```

### Step 4: Verify Setup (5 min)

```bash
# Test Docker Hub access
docker pull hello-world
docker tag hello-world:latest your-username/hello-world:test
docker push your-username/hello-world:test

# Test ArgoCD API access
curl -k -H "Authorization: Bearer $ARGOCD_TOKEN" \
  https://localhost:8080/api/version

# Expected output:
# {"Version":"v2.10.0","BuildDate":"...","GitCommit":"...","GitTreeState":"clean",...}

# Test Kubernetes connectivity
kubectl get all -n invernadero
# Should show: 7 pods running
```

### Step 5: Update ArgoCD Application URL (2 min)

```bash
# Edit k8s/argocd-application.yaml
# Change this line:
# repoURL: https://github.com/YOUR_USERNAME/SistemaInvernadero

# Example:
# repoURL: https://github.com/0Emiliano/SistemaInvernadero

# Then apply it:
kubectl apply -f k8s/argocd-application.yaml -n argocd

# Verify in ArgoCD UI:
# Applications → invernadero
# Status should show: Synced (or OutOfSync if code changed)
```

---

## ✅ Pre-Session #5 Checklist

Before Session #5 starts, verify:

- [ ] Docker Hub account created
- [ ] Personal Access Token generated
- [ ] GitHub Secrets configured (4 secrets)
- [ ] Kubernetes cluster running
- [ ] ArgoCD deployed and accessible
- [ ] ArgoCD token generated
- [ ] argocd-application.yaml updated with your repo URL
- [ ] `kubectl get all -n invernadero` shows 7 pods
- [ ] `kubectl get all -n argocd` shows ArgoCD pods

If all checked ✅, you're ready for Session #5.

---

## 📋 Session #5 Execution Plan

**Once setup is complete, Session #5 will follow this flow:**

### Phase 1: Baseline State (5 min)
```bash
# Verify current state
kubectl get all -n invernadero
kubectl get all -n argocd
kubectl logs -f deployment/invernadero-backend -n invernadero &
```

### Phase 2: Make a Test Change (2 min)
```bash
# Make a small change to trigger workflow
# Example: Update README.md or SYSTEM_100_PERCENT_COMPLETE.md

# Modify 1 line in any file
# Example in java-backend/src/main/java/.../InvernaderoApplication.java:
#   Add comment: // Session 5 validation test

# Or simpler: Update SESSION_CONTEXT.md with Session #5 start
```

### Phase 3: Push to GitHub (1 min)
```bash
git add .
git commit -m "Session #5: CI/CD validation test push"
git push origin main
```

### Phase 4: Monitor GitHub Actions (5-10 min)
```
Browser: https://github.com/0Emiliano/SistemaInvernadero/actions

Watch:
✅ backend-ci.yml workflow starts
   - Runs Maven build
   - Runs tests
   - Builds Docker image
   - Pushes to Docker Hub

✅ frontend-ci.yml workflow starts
   - Runs npm build
   - Runs linter
   - Runs tests
   - Builds Docker image
   - Pushes to Docker Hub

✅ argocd-sync.yml workflow starts (after both succeed)
   - Calls ArgoCD API
   - Waits for sync
   - Reports status
```

### Phase 5: Monitor Docker Hub (2-5 min)
```
Browser: https://hub.docker.com/r/your-username

Verify new images pushed:
✅ invernadero-backend:main-{short-sha}
✅ invernadero-backend:main-latest
✅ invernadero-frontend:main-{short-sha}
✅ invernadero-frontend:main-latest
```

### Phase 6: Monitor ArgoCD (5-10 min)
```
Browser: https://localhost:8080/applications/invernadero

Watch:
✅ Application detects new images
✅ Syncs state (OutOfSync → Syncing → Synced)
✅ Pods terminate (old) and spawn (new)
✅ Health checks pass
✅ Status shows "Synced" and "Healthy"
```

### Phase 7: Verify Deployment (5 min)
```bash
# Monitor pod rollout
kubectl rollout status deployment/invernadero-backend -n invernadero -w

# Tail logs of new pod
kubectl logs -f deployment/invernadero-backend -n invernadero

# Test API still works
curl http://localhost:8080/actuator/health

# Expected: {"status":"UP","components":{...}}
```

### Phase 8: Test Rollback (5 min)
```bash
# Manual rollback in ArgoCD UI
# Applications → invernadero → History → Click previous sync

# Or via CLI:
argocd app rollback invernadero 1 \
  --argocd-server=localhost:8080

# Verify pods rolled back to previous version
kubectl get pods -n invernadero

# Verify API still works
curl http://localhost:8080/actuator/health
```

### Phase 9: Document Results (10 min)
```bash
# Create PHASE_5_CI_CD_VALIDATION_RESULTS.md with:
# - Screenshots of workflow runs
# - Docker Hub image timestamps
# - ArgoCD sync logs
# - Kubectl pod history
# - Performance metrics
# - Any issues encountered + solutions

# Commit and push
git add PHASE_5_CI_CD_VALIDATION_RESULTS.md
git commit -m "Session #5: Document CI/CD validation results"
git push origin main
```

---

## 🎯 Expected Outcomes

### ✅ Success Criteria

All should pass:

1. ✅ GitHub Actions backend-ci.yml: PASS (Maven ✓ Tests ✓ Docker push ✓)
2. ✅ GitHub Actions frontend-ci.yml: PASS (npm ✓ Lint ✓ Tests ✓ Docker push ✓)
3. ✅ Docker Hub: New images visible (backend, frontend)
4. ✅ ArgoCD: Application syncs automatically
5. ✅ Kubernetes: Pods update with new images
6. ✅ API Health: `/actuator/health` returns UP
7. ✅ Rollback: Manual rollback works
8. ✅ End-to-End: System stays operational throughout

### ⏱️ Total Time: 45-60 minutes

| Phase | Time | What Happens |
|-------|------|--------------|
| Setup GitHub Secrets | 5 min | Add credentials |
| Push test change | 1 min | Commit to main |
| GitHub Actions runs | 5-10 min | Build, test, push |
| Docker Hub push | 2-5 min | Images appear |
| ArgoCD sync | 5-10 min | Pods update |
| Verify deployment | 5 min | API health check |
| Rollback test | 5 min | Manual rollback |
| Document results | 10 min | Write summary |
| **TOTAL** | **~50 min** | ✅ Full pipeline validated |

---

## 🚨 Troubleshooting Preview

If something goes wrong during Session #5, refer to:

- **PHASE_7_TROUBLESHOOTING.md**: Common issues + solutions
- **GitHub Actions logs**: https://github.com/0Emiliano/SistemaInvernadero/actions
- **ArgoCD UI**: https://localhost:8080/applications/invernadero
- **Kubernetes logs**: `kubectl logs -f <pod-name> -n <namespace>`

Common issues:

1. **Docker Hub push fails**: Check credentials in GitHub Secrets
2. **ArgoCD sync fails**: Check repo URL and API token
3. **Pods don't update**: Check image pull secrets
4. **API down**: Check pod logs, check resource limits

---

## 📝 Notes

- All workflows are idempotent (safe to re-run)
- All rollbacks are reversible
- Zero-downtime deployment (HPA + rolling updates)
- All data persisted (RabbitMQ, DB unaffected)
- Full observability (Prometheus logs all metrics)

---

## ✅ Ready?

Once you complete the pre-requisites above and confirm ✅ all checks, let me know and we'll start Session #5.

**Next Action**: 
1. Complete setup steps 1-5 above
2. Verify all checks in Pre-Session #5 Checklist
3. Return with confirmation

**Then Session #5 will**:
1. Push a test change to main
2. Monitor GitHub Actions workflow in real-time
3. Watch images push to Docker Hub
4. Monitor ArgoCD sync to Kubernetes
5. Verify pods update and stay healthy
6. Test rollback
7. Document everything

---

**Timeline**: 
- Setup: 30 min (one-time)
- Session #5: 45-60 min
- Total: ~1.5 hours for complete CI/CD validation

**Outcome**: Production CI/CD pipeline 100% validated and documented. ✅
