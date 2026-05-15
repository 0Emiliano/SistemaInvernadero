# Session #5 Setup - Step-by-Step Execution Guide

**Objetivo**: Completar todos los pre-requisitos para Session #5 CI/CD validation
**Tiempo Total Estimado**: 30-45 minutos
**Tu Usuario GitHub**: 0Emiliano
**Tu Email**: emiliano.rascon22@outlook.com

---

## ✅ Pre-Requisites Checklist

Marca cada paso con ✅ cuando lo completes:

- [ ] **Step 1**: Docker Hub account (5 min)
- [ ] **Step 2**: Docker Hub Personal Access Token (3 min)
- [ ] **Step 3**: GitHub Secrets configuration (5 min)
- [ ] **Step 4**: ArgoCD deployment (10 min)
- [ ] **Step 5**: ArgoCD token generation (5 min)
- [ ] **Step 6**: Verification (5 min)

---

## 📋 STEP 1: Docker Hub Account (5 min)

### 1a. Verify or Create Docker Hub Account

**Option A - Already have Docker Hub account**:
```bash
# Skip to 1c
```

**Option B - Need to create account**:
1. Go to: https://hub.docker.com/signup
2. Fill form:
   - Email: emiliano.rascon22@outlook.com (or preferred)
   - Username: 0emiliano (or preferred)
   - Password: (choose strong password)
3. Verify email
4. Continue to Step 1c

### 1b. Verify Docker installed locally

```bash
# Test Docker is installed and running
docker --version
# Expected: Docker version 25.x or higher

docker ps
# Expected: List of containers (may be empty)
```

If Docker not found:
- Install from: https://www.docker.com/products/docker-desktop
- Restart terminal

### 1c. Login to Docker locally (verify credentials)

```bash
# Test Docker Hub login
docker login

# When prompted:
# Username: your-dockerhub-username
# Password: your-dockerhub-password

# Expected output:
# Login Succeeded
```

**✅ Step 1 Complete**: Docker Hub account verified and local login works.

---

## 🔑 STEP 2: Generate Personal Access Token (3 min)

A Personal Access Token (PAT) is more secure than using your password directly.

### 2a. Create PAT in Docker Hub UI

1. Go to: https://hub.docker.com/settings/security
2. Click: "New Access Token"
3. Fill in:
   - **Access Token Description**: "GitHub Actions CI/CD"
   - **Permissions**: Check "Read, Write, Delete" (for pushing images)
4. Click: "Generate"
5. **IMPORTANT**: Copy the token immediately and **save it somewhere safe** (you won't see it again)

Example token format: `dckr_pat_abc123xyz...`

### 2b. Verify PAT works

```bash
# Logout first
docker logout

# Login with PAT
docker login

# When prompted:
# Username: your-dockerhub-username
# Password: paste-your-pat-token

# Expected output:
# Login Succeeded
```

**✅ Step 2 Complete**: PAT created and verified locally.

---

## 🔐 STEP 3: Configure GitHub Secrets (5 min)

GitHub Secrets are encrypted variables that workflows can access.

### 3a. Navigate to GitHub Secrets

1. Go to: https://github.com/0Emiliano/SistemaInvernadero
2. Click: **Settings** (top right)
3. Left sidebar: **Secrets and variables** → **Actions**
4. You should see: **Repository secrets**

### 3b. Add 4 Secrets

**Secret #1: DOCKERHUB_USERNAME**
- Name: `DOCKERHUB_USERNAME`
- Value: `your-dockerhub-username` (e.g., `0emiliano`)
- Click: "Add secret"

**Secret #2: DOCKERHUB_PASSWORD**
- Name: `DOCKERHUB_PASSWORD`
- Value: `your-pat-token` (from Step 2)
- Click: "Add secret"

**Secret #3: ARGOCD_SERVER_URL**
- Name: `ARGOCD_SERVER_URL`
- Value: `https://localhost:8080` (for now, since running locally)
- Click: "Add secret"

**Secret #4: ARGOCD_TOKEN**
- Name: `ARGOCD_TOKEN`
- Value: `(leave empty for now, will fill in Step 5)`
- Click: "Add secret"

After all 4, you should see:
```
✓ DOCKERHUB_USERNAME
✓ DOCKERHUB_PASSWORD
✓ ARGOCD_SERVER_URL
✓ ARGOCD_TOKEN
```

**✅ Step 3 Partial**: 3 of 4 secrets configured. Will complete ARGOCD_TOKEN in Step 5.

---

## ☸️ STEP 4: Deploy ArgoCD to Kubernetes (10 min)

### 4a. Verify Kubernetes is running

```bash
# Check kubectl is installed
kubectl version --client
# Expected: version.Info{Major:"1", Minor:"XX",...}

# Check cluster is running
kubectl cluster-info
# Expected: Kubernetes control plane is running at ...

# Verify invernadero namespace exists
kubectl get namespace invernadero
# Expected: NAME          STATUS   AGE
#           invernadero   Active   X days
```

If Kubernetes not running:
- Open Docker Desktop
- Settings → Kubernetes → Enable Kubernetes (checkbox)
- Wait for status to show "Kubernetes running"
- Retry commands above

### 4b. Create argocd namespace

```bash
kubectl create namespace argocd
# Expected: namespace/argocd created
# (or: namespace "argocd" already exists if from previous sessions)
```

### 4c. Deploy ArgoCD

```bash
# From project root directory
cd SistemaInvernadero

# Apply ArgoCD deployment
kubectl apply -f k8s/argocd.yaml -n argocd

# Expected output:
# deployment.apps/argocd-server created
# deployment.apps/argocd-repo-server created
# deployment.apps/argocd-application-controller created
# service/argocd-server created
# service/argocd-repo-server created
# service/argocd-application-controller created
# (or: already exists if reapplying)
```

### 4d. Wait for ArgoCD pods to be Ready (may take 1-2 min)

```bash
# Watch pods come up
kubectl get pods -n argocd -w

# Exit watch with Ctrl+C when all show 1/1 Running
# Expected final state:
# NAME                                     READY   STATUS
# argocd-server-xxx                        1/1     Running
# argocd-repo-server-xxx                   1/1     Running
# argocd-application-controller-xxx        1/1     Running

# Or use this to wait:
kubectl wait --for=condition=ready pod -l app=argocd-server -n argocd --timeout=300s
# Expected: condition met
```

### 4e. Port-forward ArgoCD to localhost:8080

```bash
# Start port-forward in background
kubectl port-forward svc/argocd-server -n argocd 8080:443 &

# Expected output:
# Forwarding from 127.0.0.1:8080 -> 8443
# (runs in background)

# Verify it's working:
curl -k https://localhost:8080
# Expected: HTML response (ArgoCD login page)
```

**✅ Step 4 Complete**: ArgoCD deployed and accessible at https://localhost:8080

---

## 🔑 STEP 5: Generate ArgoCD API Token (5 min)

### 5a. Get initial admin password

```bash
# Get the auto-generated admin password
kubectl get secret argocd-initial-admin-secret -n argocd \
  -o jsonpath="{.data.password}" | base64 -d

# Copy the output (looks like): hB7x9mK2pQr5vL8x
# Save it somewhere temporary
```

### 5b. Login to ArgoCD UI

1. Open browser: https://localhost:8080
2. Ignore certificate warning (self-signed cert)
3. Login:
   - **Username**: `admin`
   - **Password**: (from 5a above)
4. You should see: "Applications" page

### 5c. Generate API Token

1. In ArgoCD UI, top-right: click **Settings** (gear icon)
2. Left sidebar: **Accounts**
3. Click: **default** (or create new account if preferred)
4. Scroll down to: **Tokens**
5. Click: **Generate New**
6. Fill in:
   - **Token Description**: "GitHub Actions"
7. Click: **Generate**
8. **IMPORTANT**: Copy the token immediately (you won't see it again)

Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 5d. Update GitHub Secret with ArgoCD Token

1. Go to: https://github.com/0Emiliano/SistemaInvernadero
2. Settings → Secrets and variables → Actions
3. Click: **ARGOCD_TOKEN**
4. Click: **Update**
5. Paste token from 5c
6. Click: **Update secret**

**✅ Step 5 Complete**: ArgoCD token generated and added to GitHub Secrets

---

## 5️⃣ STEP 6: Verification - Test Everything (5 min)

### 6a. Verify GitHub Secrets are all set

```bash
# Cannot access secrets via CLI (they're encrypted)
# But verify they're configured:
# Go to: https://github.com/0Emiliano/SistemaInvernadero/settings/secrets/actions

# You should see all 4:
✓ DOCKERHUB_USERNAME
✓ DOCKERHUB_PASSWORD
✓ ARGOCD_SERVER_URL
✓ ARGOCD_TOKEN
```

### 6b. Verify Docker Hub access

```bash
# Test Docker login
docker logout
docker login

# Use credentials from GitHub Secrets
# Username: DOCKERHUB_USERNAME
# Password: DOCKERHUB_PASSWORD

# Expected: Login Succeeded
```

### 6c. Verify Kubernetes is ready

```bash
# Check all pods in invernadero namespace
kubectl get all -n invernadero

# Expected: 7 pods running
# - backend (3)
# - frontend (2)
# - rabbitmq (1)
# - timescaledb (1)

# If any are not running, check:
kubectl describe pod <pod-name> -n invernadero
```

### 6d. Verify ArgoCD is ready

```bash
# Check ArgoCD pods
kubectl get pods -n argocd

# Expected:
# argocd-server-xxx                    1/1     Running
# argocd-repo-server-xxx               1/1     Running
# argocd-application-controller-xxx    1/1     Running

# Test ArgoCD API
curl -k -H "Authorization: Bearer $(YOUR_ARGOCD_TOKEN)" \
  https://localhost:8080/api/version

# Replace $(YOUR_ARGOCD_TOKEN) with actual token from Step 5

# Expected JSON response with version info
```

### 6e. Update ArgoCD Application manifest

Before Session #5, need to ensure ArgoCD knows where your repo is:

```bash
# Edit k8s/argocd-application.yaml
# Change line:
# repoURL: https://github.com/0Emiliano/SistemaInvernadero

# Verify it has your correct GitHub username (0Emiliano)

# Apply it:
kubectl apply -f k8s/argocd-application.yaml -n argocd

# Check in ArgoCD UI:
# https://localhost:8080/applications/invernadero
# Status should show either "Synced" or "OutOfSync"
```

### 6f. Final Checklist

```
✅ Docker Hub account created
✅ PAT token generated and tested
✅ GitHub Secrets configured (4 secrets)
✅ ArgoCD deployed to K8s
✅ ArgoCD accessible at https://localhost:8080
✅ ArgoCD API token generated
✅ Kubernetes invernadero namespace has 7 pods
✅ Kubernetes argocd namespace has 3 pods
✅ argocd-application.yaml updated with correct repo URL
```

**✅ ALL SETUP COMPLETE**: Ready for Session #5!

---

## 🎯 Summary - What You've Setup

### Infrastructure Ready
- ✅ Kubernetes cluster running with 13 pods (7 invernadero + 3 argocd + services)
- ✅ Docker Hub account with credentials
- ✅ GitHub repository with secrets encrypted

### CI/CD Pipeline Components Ready
- ✅ GitHub Actions workflows configured to trigger on push
- ✅ Docker Hub registry ready to receive images
- ✅ ArgoCD deployment watching for image changes
- ✅ Kubernetes cluster ready for auto-deployment

### Credentials Secured
- ✅ Docker Hub PAT token (not password) in GitHub Secrets
- ✅ ArgoCD API token in GitHub Secrets
- ✅ All secrets encrypted and never exposed

---

## 📝 Next: Session #5 Execution

Once you confirm ✅ all above steps are complete, Session #5 will:

1. **Push a test change** to main branch
2. **Monitor GitHub Actions** build pipeline (3-5 min)
3. **Watch Docker images push** to Docker Hub
4. **Monitor ArgoCD sync** to Kubernetes (automatic)
5. **Verify pods update** with new images (rolling deployment)
6. **Test rollback** functionality
7. **Document all results** with evidence

**Total Session #5 time**: ~45-60 minutes

---

## ✋ STOP HERE - Confirm Completion

**When you complete all 6 steps above**:

1. Run the 6 verification commands
2. Confirm all ✅ checks pass
3. Return with message: **"Setup complete, ready for Session #5"**

Then I'll guide you through the live pipeline validation.

---

## 🆘 Troubleshooting During Setup

### Docker Issues
```bash
# Docker daemon not running?
# → Open Docker Desktop, wait for "Docker Desktop is running"

# Cannot login to Docker Hub?
# → Use PAT token instead of password
# → Go to hub.docker.com/settings/security to create/verify PAT

# docker push fails?
# → Tag image correctly: docker tag image:tag username/image:tag
# → Verify credentials: docker logout && docker login
```

### Kubernetes Issues
```bash
# kubectl not found?
# → Install: https://kubernetes.io/docs/tasks/tools/
# → Or use Docker Desktop built-in K8s

# Cluster not running?
# → Docker Desktop → Settings → Kubernetes → Enable Kubernetes
# → Wait 2-3 min for cluster to start

# Pods not ready?
# → Check: kubectl describe pod <name> -n invernadero
# → Check logs: kubectl logs <name> -n invernadero
```

### GitHub Secrets Issues
```bash
# Workflow says "Missing secret"?
# → Go to repo Settings → Secrets and verify all 4 are there
# → Secret names are case-sensitive

# Secrets not visible in UI?
# → Refresh page
# → Make sure you're in correct repo (0Emiliano/SistemaInvernadero)
```

### ArgoCD Issues
```bash
# Cannot access https://localhost:8080?
# → Check port-forward: kubectl port-forward svc/argocd-server -n argocd 8080:443
# → Try: curl -k https://localhost:8080 (should show HTML)

# Cannot get initial password?
# → kubectl get secret argocd-initial-admin-secret -n argocd
# → If doesn't exist, ArgoCD not fully deployed yet

# Cannot login to ArgoCD?
# → Use admin username
# → Use password from Step 5a (decode base64)
# → Check pod logs: kubectl logs -f deployment/argocd-server -n argocd
```

---

## ✅ You're Ready!

Follow the steps above in order. Take your time. Once all 6 steps complete with ✅ marks, message back.

**Time Investment**: 30-45 minutes now = 45-60 minute Session #5 with real live CI/CD validation.

Let's go! 🚀
