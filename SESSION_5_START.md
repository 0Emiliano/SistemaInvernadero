# 🎬 Session #5 - READY TO START

Hola Emiliano,

He preparado todo para que **completes los pre-requisitos ahora** y luego ejecutemos Session #5 en vivo.

---

## 📋 Documentos Creados

1. **SESSION_5_CI_CD_PLAN.md** - Plan completo de lo que haremos
2. **SESSION_5_SETUP_STEPS.md** - Guía paso a paso para tu setup

---

## ⚡ Quick Start (30-45 min)

### STEP 1: Docker Hub (5 min)
```bash
# Crear cuenta en hub.docker.com (o use existing)
# Generar Personal Access Token: https://hub.docker.com/settings/security
# Test locally:
docker login
# Username: your-username
# Password: paste-token
# Result: Login Succeeded
```

### STEP 2: GitHub Secrets (5 min)
```
Repo → Settings → Secrets and variables → Actions
Add 4 secrets:
- DOCKERHUB_USERNAME = your-username
- DOCKERHUB_PASSWORD = your-pat-token  
- ARGOCD_SERVER_URL = https://localhost:8080
- ARGOCD_TOKEN = (Step 5)
```

### STEP 3: Deploy ArgoCD (10 min)
```bash
kubectl create namespace argocd
kubectl apply -f k8s/argocd.yaml -n argocd
kubectl wait --for=condition=ready pod -l app=argocd-server -n argocd --timeout=300s
kubectl port-forward svc/argocd-server -n argocd 8080:443 &
```

### STEP 4: Get ArgoCD Token (5 min)
```bash
# Get password
kubectl get secret argocd-initial-admin-secret -n argocd \
  -o jsonpath="{.data.password}" | base64 -d

# Login: https://localhost:8080 (admin / password)
# Settings → Accounts → Generate new token
# Copy token → Add to GitHub Secrets (ARGOCD_TOKEN)
```

### STEP 5: Verify Everything (5 min)
```bash
# Check all 4 secrets in GitHub
# Check 7 pods in invernadero namespace
# Check 3 pods in argocd namespace  
# Test: curl -k https://localhost:8080
```

---

## ✅ When You Complete All 5 Steps

Message back: **"Setup complete, ready for Session #5"**

Then I'll:
1. Guide you through pushing a test change
2. Monitor GitHub Actions in real-time
3. Watch Docker images push to Docker Hub
4. See ArgoCD auto-sync to Kubernetes
5. Verify zero-downtime deployment
6. Test rollback
7. Document everything

---

## 📊 Timeline

- **Setup (now)**: 30-45 min (one-time)
- **Session #5 (live)**: 45-60 min
- **Total**: ~1.5-2 hours for complete CI/CD validation

---

## 🚀 Start Now!

Open `SESSION_5_SETUP_STEPS.md` and follow each step carefully.

I'm ready when you are. ✅
