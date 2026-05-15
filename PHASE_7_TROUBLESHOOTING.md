# GitHub Actions + ArgoCD Troubleshooting Guide

## Common Issues & Solutions

---

## GitHub Actions Issues

### 1. Docker Hub Push Fails - 401 Unauthorized

**Problem:**
```
Error response from daemon: unauthorized: authentication required
```

**Solution:**
```bash
# 1. Verify credentials in GitHub Secrets
# Settings → Secrets and variables → Actions → DOCKERHUB_USERNAME, DOCKERHUB_PASSWORD

# 2. If using Personal Access Token:
# - Go to docker.com → Settings → Security → New Access Token
# - Copy token value
# - Update DOCKERHUB_PASSWORD secret

# 3. Test locally
echo $DOCKERHUB_PASSWORD | docker login -u $DOCKERHUB_USERNAME --password-stdin
docker push docker.io/$DOCKERHUB_USERNAME/invernadero-backend:test
```

### 2. Maven Tests Timeout

**Problem:**
```
Tests running but never complete (timeout)
```

**Solution:**
```yaml
# In backend-ci.yml, increase timeout:
- name: Run tests
  run: |
    cd java-backend
    mvn test -Darguments="-DskipTests=false" --batch-mode
  timeout-minutes: 30  # Increase if needed
```

### 3. Node Dependencies Installation Fails

**Problem:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution:**
```bash
# Locally
npm install --legacy-peer-deps

# Commit updated package-lock.json
git add package-lock.json
git commit -m "Update npm dependencies"
git push
```

### 4. Build Context Issues with Docker

**Problem:**
```
COPY java-backend/target/... file not found
```

**Solution:**
```yaml
# In frontend-ci.yml or backend-ci.yml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    context: ./java-backend  # ← Specify correct context
    file: ./Dockerfile      # ← Ensure path is correct
    push: true
```

---

## ArgoCD Issues

### 1. ArgoCD Application Shows "OutOfSync"

**Problem:**
```
Application state differs from Git repository
```

**Solution:**
```bash
# Manual sync
argocd app sync invernadero --argocd-server=localhost:8080

# Or via kubectl
kubectl patch application invernadero -n argocd \
  -p '{"spec":{"syncPolicy":{"syncOptions":["Refresh=hard"]}}}' --type merge

# Force refresh
argocd app refresh invernadero --argocd-server=localhost:8080 --hard
```

### 2. ArgoCD Can't Authenticate to Git Repo

**Problem:**
```
authentication required
repository not accessible
```

**Solution:**
```bash
# Create SSH key for ArgoCD
ssh-keygen -t rsa -f /tmp/argocd-key -N ""

# Add public key to GitHub
# Settings → Deploy keys → Add new

# Create secret in ArgoCD namespace
kubectl create secret generic argocd-ssh-key \
  -n argocd \
  --from-file=/tmp/argocd-key

# Update ArgoCD repository config
kubectl edit secret argocd-ssh-key -n argocd
```

### 3. ArgoCD Deployment Fails - ImagePullBackOff

**Problem:**
```
Failed to pull image: Unauthorized
```

**Solution:**
```bash
# Create imagePullSecret
kubectl create secret docker-registry docker-registry-secret \
  --docker-server=docker.io \
  --docker-username=$DOCKERHUB_USERNAME \
  --docker-password=$DOCKERHUB_PASSWORD \
  -n invernadero

# Update backend deployment to use it
kubectl patch serviceaccount default -n invernadero \
  -p '{"imagePullSecrets":[{"name":"docker-registry-secret"}]}'

# Or patch deployment
kubectl patch deployment invernadero-backend -n invernadero --type='json' \
  -p='[{"op": "add", "path": "/spec/template/spec/imagePullSecrets", "value":[{"name":"docker-registry-secret"}]}]'
```

### 4. ArgoCD Webhook Not Triggering

**Problem:**
```
Push to GitHub but ArgoCD doesn't sync
```

**Solution:**
```bash
# Manual trigger (GitHub CLI)
gh workflow run argocd-sync.yml -r main

# Or check GitHub webhook logs
# Repo → Settings → Webhooks → Click webhook → Deliveries

# Verify ArgoCD webhook is configured
kubectl get secret argocd-github-secret -n argocd

# Re-add webhook
# Settings → Webhooks → Delete old → Add new from ArgoCD UI
```

### 5. ArgoCD Server Connection Refused

**Problem:**
```
curl: (7) Failed to connect to localhost:8080: Connection refused
```

**Solution:**
```bash
# Verify ArgoCD is running
kubectl get pods -n argocd

# If not running, check why
kubectl describe pod -n argocd -l app=argocd-server

# Restart ArgoCD
kubectl rollout restart deployment/argocd-server -n argocd

# Port-forward again
kubectl port-forward svc/argocd-server -n argocd 8080:443 &

# Verify connectivity
curl -k https://localhost:8080/api/version
```

---

## Integration Issues

### 1. GitHub Actions → ArgoCD → Kubernetes Flow Breaks

**Diagnosis:**
```bash
# Check each step

# Step 1: Actions succeeded?
# → Go to Actions tab, check workflow runs

# Step 2: Image pushed to Docker Hub?
docker search your-username/invernadero-backend

# Step 3: ArgoCD sees the change?
argocd app get invernadero --argocd-server=localhost:8080

# Step 4: Kubernetes deployed new version?
kubectl get deployment -n invernadero -o wide
kubectl describe deployment invernadero-backend -n invernadero
```

### 2. Slow Sync (Takes >5 minutes)

**Problem:**
```
Push to GitHub, but deployment takes too long
```

**Solution:**
```bash
# Check ArgoCD repo refresh interval
kubectl get application invernadero -n argocd -o yaml | grep refreshInterval

# Update to 30s (faster polling)
kubectl patch application invernadero -n argocd --type merge \
  -p '{"spec":{"autoSync":{"prune":true},"sourceMetadata":{"revisedMetadata":{"refreshInterval":"30s"}}}}'

# Or use webhook for instant sync (see above)
```

### 3. Webhook Timeout

**Problem:**
```
GitHub webhook delivery timing out
```

**Solution:**
```bash
# Run ArgoCD sync asynchronously (already done in workflows)
# Reduce timeout in argocd-sync.yml:

- name: Wait for sync to complete
  run: |
    for i in {1..30}; do  # Reduce from 60 to 30 (2.5 min timeout)
      STATUS=$(curl -s ...)
```

---

## Testing Locally

### Simulate GitHub Actions Workflow

```bash
# Install act
brew install act  # macOS
# Or: https://github.com/nektos/act

# Run backend workflow
act push -j build-image -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:full-latest

# Run frontend workflow
act push -j build-image -W .github/workflows/frontend-ci.yml
```

### Test Docker Build

```bash
# Backend
docker build -t invernadero-backend:test -f Dockerfile ./java-backend

# Frontend
docker build -t invernadero-frontend:test .

# Test push (to registry)
docker tag invernadero-backend:test docker.io/$DOCKERHUB_USERNAME/invernadero-backend:local
docker push docker.io/$DOCKERHUB_USERNAME/invernadero-backend:local
```

### Test Maven Locally

```bash
cd java-backend
mvn clean package -DskipTests  # Skip tests first
mvn test                        # Then run tests separately
```

---

## Monitoring & Logging

### GitHub Actions Logs

```bash
# View logs directly
# Repository → Actions → Click workflow run → Click job

# Or use GitHub CLI
gh run view <run-id> --log
```

### ArgoCD Logs

```bash
# ArgoCD server logs
kubectl logs -f deployment/argocd-server -n argocd

# ArgoCD application controller logs
kubectl logs -f deployment/argocd-application-controller -n argocd

# Repo server logs
kubectl logs -f deployment/argocd-repo-server -n argocd
```

### Kubernetes Deployment Logs

```bash
# Latest pod logs
kubectl logs -f deployment/invernadero-backend -n invernadero

# All pods in deployment
kubectl logs -f -l app=invernadero-backend -n invernadero

# Previous pod (if crashed)
kubectl logs -p pod/invernadero-backend-xxx -n invernadero
```

---

## Rollback Procedures

### Automatic Rollback (if sync fails)

Already configured in `argocd-application.yaml`:
```yaml
retry:
  limit: 5
  backoff:
    duration: 5s
    factor: 2
    maxDuration: 3m
```

### Manual Rollback via ArgoCD

```bash
# List previous syncs
argocd app get invernadero --argocd-server=localhost:8080 | grep -A 5 "Sync History"

# Rollback to previous revision
argocd app rollback invernadero 1 --argocd-server=localhost:8080

# Confirm rollback
argocd app get invernadero --argocd-server=localhost:8080
```

### Manual Rollback via kubectl

```bash
# View rollout history
kubectl rollout history deployment/invernadero-backend -n invernadero

# Rollback to previous version
kubectl rollout undo deployment/invernadero-backend -n invernadero

# Rollback to specific revision
kubectl rollout undo deployment/invernadero-backend -n invernadero --to-revision=2
```

---

## Performance Optimization

### Faster Builds

```yaml
# Use maven cache in GitHub Actions
- uses: actions/cache@v3
  with:
    path: ~/.m2/repository
    key: ${{ runner.os }}-maven-${{ hashFiles('**/pom.xml') }}
    restore-keys: |
      ${{ runner.os }}-maven-

# Use npm cache
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### Parallel Builds

Docker Buildx already parallelizes layers. For Maven:

```bash
mvn -T 1C clean install  # Parallel threads
```

---

## Support Commands

```bash
# Generate debug bundle
argocd admin diagnostics > diagnostics.log

# Export application config
kubectl get application invernadero -n argocd -o yaml > app-backup.yaml

# Check all resources
kubectl get all -n invernadero
kubectl get all -n argocd

# Test connectivity
nc -zv docker.io 443
nc -zv github.com 22
```

---

**For additional support, check logs first, then try manual sync/rollback.**
