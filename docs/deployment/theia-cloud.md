# Quallaa Multi-Tenant Deployment Guide: Theia Cloud on Kubernetes

**Last Updated:** January 2025
**Theia Cloud Version:** 1.0+
**Target Audience:** DevOps engineers, technical founders, backend developers

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture Diagram](#architecture-diagram)
4. [Phase 1: Kubernetes Cluster Setup](#phase-1-kubernetes-cluster-setup)
5. [Phase 2: Install Dependencies](#phase-2-install-dependencies)
6. [Phase 3: Install Theia Cloud](#phase-3-install-theia-cloud)
7. [Phase 4: Build & Deploy Quallaa Docker Image](#phase-4-build--deploy-quallaa-docker-image)
8. [Phase 5: Authentication Setup](#phase-5-authentication-setup)
9. [Phase 6: Custom Landing Page](#phase-6-custom-landing-page)
10. [Phase 7: Testing & Validation](#phase-7-testing--validation)
11. [Phase 8: Production Hardening](#phase-8-production-hardening)
12. [Monitoring & Observability](#monitoring--observability)
13. [Troubleshooting](#troubleshooting)
14. [Cost Optimization](#cost-optimization)
15. [Maintenance & Updates](#maintenance--updates)

---

## Overview

This guide walks you through deploying **Quallaa** as a multi-tenant SaaS application using **Theia Cloud**, the official orchestration framework for Theia-based IDEs on Kubernetes.

### What You'll Build

- **Multi-tenant IDE platform** where each user gets an isolated Quallaa workspace
- **Automatic workspace lifecycle management** (start, stop, timeout)
- **Authentication system** with Keycloak (OAuth2/OIDC)
- **Production-ready infrastructure** on Kubernetes
- **Custom landing page** for user workspace management

### Timeline Estimate

- **With K8s experience:** 5-7 days
- **New to Kubernetes:** 2-3 weeks
- **Production-ready:** Add 1 additional week for hardening

### Cost Estimate

- **Development (Minikube):** $0 (local laptop)
- **Staging (Small K8s cluster):** $100-150/month
- **Production (100 users, 30% concurrency):** $200-400/month

---

## Prerequisites

### Required Skills

- ✅ Basic Linux command line
- ✅ Understanding of Docker containers
- ✅ DNS configuration (pointing domains to IP addresses)
- ⚠️ Kubernetes basics (recommended but can learn as you go)
- ⚠️ Helm charts (template language, not required to be expert)

### Required Software (Local Machine)

```bash
# 1. kubectl (Kubernetes CLI)
# macOS
brew install kubectl

# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Verify
kubectl version --client

# 2. Helm (Kubernetes package manager)
# macOS
brew install helm

# Linux
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify
helm version

# 3. Docker (for building Quallaa image)
# macOS: Docker Desktop
# Linux: Docker Engine
# Verify
docker version

# 4. Optional: Minikube (for local testing)
# macOS
brew install minikube

# Linux
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

### Required Infrastructure

**Option A: Managed Kubernetes (Recommended for Production)**
- DigitalOcean Kubernetes (~$120/month for 2-node cluster)
- Google Kubernetes Engine (~$150/month)
- AWS EKS (~$200/month)
- Azure AKS (~$150/month)

**Option B: Local Development (Free)**
- Minikube on your laptop (4+ cores, 8GB+ RAM recommended)

**Option C: Self-Managed Kubernetes**
- 2-3 VPS instances with k3s or kubeadm (~$40-60/month but requires more expertise)

### Required External Services

1. **Domain Name** (e.g., `quallaa.com`)
   - Cost: ~$10-15/year

2. **Container Registry** (for storing Quallaa Docker image)
   - GitHub Container Registry (free for public images)
   - Docker Hub (free tier available)
   - Cloud provider registries (GCR, ECR, DOCR)

3. **Email for SSL Certificates**
   - Used by Let's Encrypt for cert-manager

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                           │
│                  https://ide.quallaa.com                        │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DNS & SSL (Let's Encrypt)                  │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    KUBERNETES CLUSTER                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  INGRESS CONTROLLER (nginx)                               │  │
│  │  Routes: ide.quallaa.com/* → User Workspaces             │  │
│  └────────────┬──────────────────────────────────────────────┘  │
│               │                                                  │
│  ┌────────────▼──────────────────────────────────────────────┐  │
│  │  THEIA CLOUD COMPONENTS                                   │  │
│  │  ┌──────────────────┐  ┌──────────────────┐              │  │
│  │  │  REST API        │  │  K8s Operator    │              │  │
│  │  │  (Session CRUD)  │◄─┤  (Manages Pods)  │              │  │
│  │  └──────────────────┘  └──────────────────┘              │  │
│  │                                                            │  │
│  │  ┌──────────────────┐  ┌──────────────────┐              │  │
│  │  │  Landing Page    │  │  Monitor         │              │  │
│  │  │  (Sample UI)     │  │  (Idle Timeout)  │              │  │
│  │  └──────────────────┘  └──────────────────┘              │  │
│  └────────────┬──────────────────────────────────────────────┘  │
│               │                                                  │
│  ┌────────────▼──────────────────────────────────────────────┐  │
│  │  USER WORKSPACE PODS (Quallaa instances)                  │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐          │  │
│  │  │ User 1 Pod │  │ User 2 Pod │  │ User 3 Pod │  ...     │  │
│  │  │ Quallaa:   │  │ Quallaa:   │  │ Quallaa:   │          │  │
│  │  │ Port 3000  │  │ Port 3000  │  │ Port 3000  │          │  │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘          │  │
│  │        │               │               │                   │  │
│  └────────┼───────────────┼───────────────┼──────────────────┘  │
│           │               │               │                      │
│  ┌────────▼───────────────▼───────────────▼──────────────────┐  │
│  │  PERSISTENT VOLUMES (User workspaces & data)              │  │
│  │  /workspace-user1    /workspace-user2    /workspace-user3 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  KEYCLOAK (Authentication)                                │  │
│  │  OAuth2/OIDC Provider                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Kubernetes Cluster Setup

Choose **ONE** of the following options based on your needs.

### Option A: Minikube (Local Development)

**Best for:** Testing, development, learning Theia Cloud at zero cost

```bash
# 1. Start Minikube with adequate resources
minikube start \
  --cpus=4 \
  --memory=8192 \
  --disk-size=40g \
  --driver=docker

# 2. Enable ingress addon (replaces ingress-nginx)
minikube addons enable ingress

# 3. Verify cluster is running
kubectl cluster-info
kubectl get nodes

# 4. Get Minikube IP (you'll use this as baseHost later)
minikube ip
# Example output: 192.168.49.2

# 5. Add to /etc/hosts for local DNS
echo "$(minikube ip) ide.quallaa.local" | sudo tee -a /etc/hosts
```

**Note:** Minikube uses `.local` domain. SSL certificates will be self-signed (browser warnings expected).

---

### Option B: DigitalOcean Kubernetes (Recommended for Production)

**Best for:** Production deployment, managed service, predictable cost

```bash
# 1. Install doctl CLI
# macOS
brew install doctl

# Linux
cd ~
wget https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
tar xf doctl-*.tar.gz
sudo mv doctl /usr/local/bin

# 2. Authenticate with DigitalOcean
doctl auth init
# Enter your DigitalOcean API token

# 3. Create Kubernetes cluster
doctl kubernetes cluster create quallaa-prod \
  --region nyc1 \
  --version 1.29.1-do.0 \
  --node-pool "name=workers;size=s-2vcpu-4gb;count=2;auto-scale=true;min-nodes=2;max-nodes=5"

# This takes ~5-10 minutes
# Cost: ~$48/month per node = $96-240/month total (2-5 nodes)

# 4. Configure kubectl to use the cluster
doctl kubernetes cluster kubeconfig save quallaa-prod

# 5. Verify
kubectl get nodes
# Should show 2 nodes in "Ready" state

# 6. Get Load Balancer IP (will be assigned after ingress installation)
# We'll return to this after installing ingress-nginx
```

---

### Option C: Google Kubernetes Engine (GKE)

**Best for:** Enterprise scale, Google Cloud ecosystem integration

```bash
# 1. Install gcloud CLI
# macOS
brew install google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# 2. Initialize and authenticate
gcloud init
gcloud auth login

# 3. Set project
gcloud config set project YOUR_PROJECT_ID

# 4. Create GKE cluster
gcloud container clusters create quallaa-prod \
  --zone us-central1-a \
  --num-nodes 2 \
  --machine-type e2-standard-2 \
  --enable-autoscaling \
  --min-nodes 2 \
  --max-nodes 5 \
  --disk-size 40

# Cost: ~$50-60/month per node = $100-300/month total

# 5. Get credentials
gcloud container clusters get-credentials quallaa-prod --zone us-central1-a

# 6. Verify
kubectl get nodes
```

---

### Option D: AWS EKS

**Best for:** AWS ecosystem integration, enterprise requirements

```bash
# 1. Install eksctl
# macOS
brew install eksctl

# Linux
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# 2. Install AWS CLI and configure
aws configure

# 3. Create EKS cluster
eksctl create cluster \
  --name quallaa-prod \
  --region us-east-1 \
  --nodes 2 \
  --node-type t3.medium \
  --nodes-min 2 \
  --nodes-max 5 \
  --managed

# This takes ~15-20 minutes
# Cost: ~$73/month per node + $73/month control plane = ~$219/month minimum

# 4. Verify
kubectl get nodes
```

---

## Phase 2: Install Dependencies

### Step 1: Install cert-manager (SSL Certificates)

cert-manager automatically provisions and renews SSL certificates from Let's Encrypt.

```bash
# 1. Install cert-manager CRDs and controller
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml

# 2. Wait for cert-manager to be ready
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/instance=cert-manager \
  -n cert-manager \
  --timeout=120s

# 3. Verify installation
kubectl get pods -n cert-manager
# Should show 3 pods: cert-manager, cert-manager-cainjector, cert-manager-webhook

# All should be "Running" with 1/1 ready
```

**Troubleshooting:**
```bash
# If pods are not running:
kubectl describe pod -n cert-manager -l app.kubernetes.io/instance=cert-manager
kubectl logs -n cert-manager deployment/cert-manager
```

---

### Step 2: Install ingress-nginx (Traffic Routing)

**Skip this if using Minikube** (you already enabled the ingress addon).

```bash
# 1. Add Helm repo
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# 2. Install ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer

# 3. Wait for LoadBalancer to provision
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# 4. Get LoadBalancer external IP (this is your cluster's public IP)
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Example output:
# NAME                       TYPE           EXTERNAL-IP       PORT(S)
# ingress-nginx-controller   LoadBalancer   203.0.113.45      80:32080/TCP,443:32443/TCP

# IMPORTANT: Note the EXTERNAL-IP (e.g., 203.0.113.45)
# This is where you'll point your DNS
```

**DNS Configuration:**

Once you have the external IP:

1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Create an A record:
   - **Host:** `ide` (or `*` for wildcard)
   - **Value:** Your EXTERNAL-IP (e.g., `203.0.113.45`)
   - **TTL:** 300 (5 minutes)

3. Wait for DNS propagation (5-60 minutes)

4. Verify DNS:
   ```bash
   nslookup ide.quallaa.com
   # Should return your EXTERNAL-IP
   ```

---

## Phase 3: Install Theia Cloud

### Step 1: Add Theia Cloud Helm Repository

```bash
# 1. Add Helm repo
helm repo add theia-cloud-repo https://eclipse-theia.github.io/theia-cloud-helm/

# 2. Update repos
helm repo update

# 3. Verify repo is added
helm search repo theia-cloud
# Should show: theia-cloud-base, theia-cloud-crds, theia-cloud
```

---

### Step 2: Install theia-cloud-base (Cluster-Wide Resources)

```bash
# 1. Create values file for base chart
cat > theia-cloud-base-values.yaml <<EOF
issuer:
  # Your email for Let's Encrypt notifications
  email: devops@quallaa.com
  # Use letsencrypt-prod for production
  # Use letsencrypt-staging for testing (avoids rate limits)
  name: letsencrypt-prod
EOF

# 2. Install base chart
helm install theia-cloud-base \
  theia-cloud-repo/theia-cloud-base \
  -f theia-cloud-base-values.yaml

# 3. Verify ClusterIssuer was created
kubectl get clusterissuer
# Should show: letsencrypt-prod or letsencrypt-staging

# 4. Check issuer status
kubectl describe clusterissuer letsencrypt-prod
# Look for "Status: Ready"
```

---

### Step 3: Install theia-cloud-crds (Custom Resource Definitions)

```bash
# 1. Create namespace for Quallaa
kubectl create namespace quallaa

# 2. Install CRDs
helm install theia-cloud-crds \
  theia-cloud-repo/theia-cloud-crds \
  --namespace quallaa

# 3. Verify CRDs are installed
kubectl get crd | grep theia.cloud
# Should show:
# appdefinitions.theia.cloud
# sessions.theia.cloud
# workspaces.theia.cloud
```

---

### Step 4: Install theia-cloud (Main Chart)

This is the core Theia Cloud system: Operator, REST API, and Monitor.

```bash
# 1. Generate a unique App ID
# This identifies your Theia Cloud installation
APP_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
echo "Your App ID: $APP_ID"
# Example: d5f8c3a7-1b4e-4f9d-8c2e-5a6b7c8d9e0f

# 2. Create main values file
cat > theia-cloud-values.yaml <<EOF
# App ID (unique identifier)
appId: "$APP_ID"

# Hosts configuration
hosts:
  configuration:
    # Your domain (WITHOUT protocol)
    baseHost: "ide.quallaa.com"

  paths:
    # API endpoint path
    service: "/api"
    # Landing page path
    landing: "/"

# Ingress configuration
ingress:
  clusterIssuer: "letsencrypt-prod"
  # Use ingress-nginx
  ingressClassName: "nginx"

# Keycloak integration (we'll set this up in Phase 5)
keycloak:
  enabled: false  # Start without auth for testing
  # authUrl: "https://auth.quallaa.com"
  # realm: "quallaa"
  # clientId: "theia-cloud"

# Operator configuration
operator:
  # Docker image for Theia Cloud operator
  image: "theiacloud/theia-cloud-operator:1.0.0"

  # CloudProvider: K8S, MINIKUBE, or GKE
  cloudProvider: "K8S"  # Use "MINIKUBE" if on Minikube

  # Instance configuration
  instance:
    # Namespace for user workspace pods
    namespace: "quallaa"

# Service configuration
service:
  image: "theiacloud/theia-cloud-service:1.0.0"

# Landing page
landing:
  image: "theiacloud/theia-cloud-landing-page:1.0.0"
EOF

# 3. Install Theia Cloud
helm install theia-cloud \
  theia-cloud-repo/theia-cloud \
  --namespace quallaa \
  -f theia-cloud-values.yaml

# 4. Wait for pods to be ready
kubectl wait --for=condition=ready pod \
  -l app=theia-cloud \
  -n quallaa \
  --timeout=300s

# 5. Verify all components are running
kubectl get pods -n quallaa

# Expected output:
# NAME                                    READY   STATUS    RESTARTS
# theia-cloud-operator-xxx                1/1     Running   0
# theia-cloud-service-xxx                 1/1     Running   0
# theia-cloud-landing-page-xxx            1/1     Running   0
```

---

### Step 5: Verify Installation

```bash
# 1. Check all Theia Cloud resources
kubectl get all -n quallaa

# 2. Check ingress was created
kubectl get ingress -n quallaa

# 3. Test landing page (wait 2-3 minutes for DNS + SSL)
curl -I https://ide.quallaa.com
# Should return: HTTP/2 200

# 4. View logs
kubectl logs -n quallaa deployment/theia-cloud-operator
kubectl logs -n quallaa deployment/theia-cloud-service

# No errors should appear
```

**Troubleshooting SSL:**

If you get SSL certificate errors:

```bash
# Check certificate status
kubectl describe certificate -n quallaa

# View cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager

# Common issues:
# - DNS not propagated yet (wait 10-60 minutes)
# - Rate limit hit (use letsencrypt-staging for testing)
# - Email invalid
```

---

## Phase 4: Build & Deploy Quallaa Docker Image

Now we'll containerize your current Quallaa codebase and deploy it via Theia Cloud.

### Step 1: Create Dockerfile for Quallaa

```bash
# Navigate to your Quallaa repo
cd /Users/jefftoffoli/Documents/GitHub/Quallaa-Native

# Create Dockerfile in examples/browser/
cat > examples/browser/Dockerfile <<'EOF'
# Multi-stage build for smaller image size

# Stage 1: Build
FROM node:20-bullseye AS build

# Install dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy root package files
COPY package*.json lerna.json ./
COPY .npmrc* ./

# Copy all package.json files first (better layer caching)
COPY packages ./packages
COPY dev-packages ./dev-packages
COPY examples ./examples

# Install dependencies
RUN npm install

# Compile TypeScript
RUN npm run compile

# Build browser example specifically
WORKDIR /app/examples/browser
RUN npm run build:production

# Stage 2: Runtime
FROM node:20-bullseye-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN useradd -m -u 1001 -s /bin/bash theia

# Set working directory
WORKDIR /home/theia

# Copy built application from build stage
COPY --from=build --chown=theia:theia /app/examples/browser ./app

# Copy necessary packages
COPY --from=build --chown=theia:theia /app/node_modules ./node_modules
COPY --from=build --chown=theia:theia /app/packages ./packages

# Create workspace directory
RUN mkdir -p /home/theia/workspace && chown -R theia:theia /home/theia

# Switch to non-root user
USER theia

# Set environment
ENV HOME=/home/theia
ENV SHELL=/bin/bash
ENV THEIA_DEFAULT_PLUGINS=local-dir:/home/theia/plugins

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start Theia
WORKDIR /home/theia/app
CMD ["node", "src-gen/backend/main.js", "--hostname=0.0.0.0", "--port=3000"]
EOF
```

---

### Step 2: Build and Push Docker Image

```bash
# 1. Choose your container registry
# Option A: GitHub Container Registry (recommended, free for public images)
REGISTRY="ghcr.io"
USERNAME="your-github-username"  # Replace with your GitHub username
IMAGE_NAME="quallaa"
TAG="latest"

FULL_IMAGE="$REGISTRY/$USERNAME/$IMAGE_NAME:$TAG"

# Option B: Docker Hub
# REGISTRY="docker.io"
# USERNAME="your-dockerhub-username"
# FULL_IMAGE="$USERNAME/$IMAGE_NAME:$TAG"

# 2. Login to registry
# GitHub Container Registry:
echo $GITHUB_TOKEN | docker login ghcr.io -u $USERNAME --password-stdin
# (Get token from: https://github.com/settings/tokens - needs write:packages scope)

# Docker Hub:
# docker login

# 3. Build image
cd /Users/jefftoffoli/Documents/GitHub/Quallaa-Native/examples/browser

docker build -t $FULL_IMAGE .

# This takes 10-20 minutes on first build

# 4. Test image locally (optional but recommended)
docker run -p 3000:3000 $FULL_IMAGE

# Visit http://localhost:3000 - Quallaa should load
# Ctrl+C to stop

# 5. Push to registry
docker push $FULL_IMAGE

# 6. Verify image is accessible
docker pull $FULL_IMAGE
```

**Troubleshooting Build Issues:**

```bash
# If build fails at npm install:
# - Check Node version in Dockerfile matches your local (node:20)
# - Ensure lerna.json and package.json are copied

# If build fails at compile:
# - May need to increase Docker memory (Docker Desktop settings)

# If build succeeds but image doesn't start:
# - Check logs: docker logs <container-id>
# - Verify port 3000 is exposed
```

---

### Step 3: Create AppDefinition for Quallaa

```bash
# 1. Create AppDefinition YAML
cat > quallaa-app-definition.yaml <<EOF
apiVersion: theia.cloud/v1beta9
kind: AppDefinition
metadata:
  name: quallaa
  namespace: quallaa
spec:
  # Display name
  name: "Quallaa IDE"

  # Docker image you just pushed
  image: "ghcr.io/your-github-username/quallaa:latest"

  # Pull policy
  imagePullPolicy: Always

  # If using private registry, create secret and reference here:
  # pullSecret: "regcred"

  # Port Quallaa listens on (default: 3000)
  port: 3000

  # Ingress name
  ingressname: "quallaa"

  # Instance limits
  minInstances: 0     # Scale to zero when no users
  maxInstances: 10    # Max concurrent workspaces

  # Idle timeout (minutes)
  timeout: 30

  # Resource requests (guaranteed)
  requestsMemory: "1Gi"
  requestsCpu: "500m"  # 0.5 CPU cores

  # Resource limits (maximum)
  limitsMemory: "2Gi"
  limitsCpu: "1000m"   # 1 CPU core

  # Startup probe (waits for app to be ready)
  downlinkLimit: 0
  uplinkLimit: 0

  # Environment variables (optional)
  env:
    - name: THEIA_WEBVIEW_EXTERNAL_ENDPOINT
      value: "{{hostname}}"
EOF

# 2. Apply AppDefinition
kubectl apply -f quallaa-app-definition.yaml

# 3. Verify AppDefinition was created
kubectl get appdefinitions -n quallaa

# Output should show:
# NAME      AGE
# quallaa   10s

# 4. Check operator processed it
kubectl logs -n quallaa deployment/theia-cloud-operator --tail=50

# Look for: "AppDefinition created: quallaa"
```

---

### Step 4: Test Session Creation

```bash
# 1. Get Theia Cloud service URL
SERVICE_URL="https://ide.quallaa.com/api"

# 2. Create a test session (without auth for now)
curl -X POST "$SERVICE_URL/session" \
  -H "Content-Type: application/json" \
  -d '{
    "appDefinition": "quallaa",
    "user": "testuser@quallaa.com",
    "appId": "'$APP_ID'"
  }'

# Expected response:
# {
#   "sessionName": "quallaa-testuser-xxx",
#   "sessionUrl": "https://ide.quallaa.com/testuser-xxx",
#   "error": false
# }

# 3. Watch workspace pod start
kubectl get pods -n quallaa -w

# You should see a new pod: quallaa-testuser-xxx
# Status progression: Pending -> ContainerCreating -> Running

# 4. Check session via API
curl "$SERVICE_URL/session?user=testuser@quallaa.com&appId=$APP_ID"

# 5. Visit the session URL from the response
# Open in browser: https://ide.quallaa.com/testuser-xxx

# Quallaa should load! 🎉

# 6. Check workspace pod logs
kubectl logs -n quallaa -l app=quallaa --tail=100

# 7. After 30 minutes of inactivity, pod should auto-terminate
# Check operator logs:
kubectl logs -n quallaa deployment/theia-cloud-operator --tail=50
```

**Troubleshooting:**

```bash
# If pod fails to start:
kubectl describe pod -n quallaa <pod-name>

# Common issues:
# - Image pull failed: Check registry auth, image name
# - CrashLoopBackOff: Check app logs
# - OOMKilled: Increase limitsMemory
# - Port mismatch: Ensure port: 3000 matches Dockerfile EXPOSE

# If session creation fails:
# - Check service logs: kubectl logs -n quallaa deployment/theia-cloud-service
# - Verify AppDefinition exists: kubectl get appdefinitions -n quallaa
# - Check operator logs for errors
```

---

## Phase 5: Authentication Setup

By default, Theia Cloud has no authentication. Let's add Keycloak for secure multi-tenant access.

### Option A: Deploy Keycloak on Kubernetes

```bash
# 1. Add Keycloak Helm repo
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# 2. Create Keycloak values
cat > keycloak-values.yaml <<EOF
auth:
  adminUser: admin
  adminPassword: "ChangeThisSecurePassword123!"

postgresql:
  enabled: true
  auth:
    password: "PostgresSecurePassword123!"

ingress:
  enabled: true
  ingressClassName: nginx
  hostname: auth.quallaa.com
  tls: true
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
EOF

# 3. Create namespace
kubectl create namespace auth

# 4. Install Keycloak
helm install keycloak bitnami/keycloak \
  --namespace auth \
  -f keycloak-values.yaml

# This takes 3-5 minutes

# 5. Wait for Keycloak to be ready
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/name=keycloak \
  -n auth \
  --timeout=300s

# 6. Get admin password (if you forgot)
kubectl get secret keycloak -n auth -o jsonpath="{.data.admin-password}" | base64 -d

# 7. Access Keycloak admin console
echo "Keycloak Admin: https://auth.quallaa.com/admin"
echo "Username: admin"
echo "Password: <from step 6>"
```

---

### Configure Keycloak Realm

```bash
# 1. Log in to Keycloak admin console
# https://auth.quallaa.com/admin

# 2. Create Realm
# - Click "Create Realm" (top left dropdown)
# - Name: quallaa
# - Click "Create"

# 3. Create Client for Theia Cloud
# - Navigate to: Clients → Create client
# - Client ID: theia-cloud
# - Client Protocol: openid-connect
# - Click "Next"
# - Client authentication: ON
# - Authorization: OFF
# - Authentication flow:
#   ✅ Standard flow
#   ✅ Direct access grants
# - Click "Save"

# 4. Configure Client URLs
# - Valid redirect URIs: https://ide.quallaa.com/*
# - Valid post logout redirect URIs: https://ide.quallaa.com/*
# - Web origins: https://ide.quallaa.com
# - Click "Save"

# 5. Get Client Secret
# - Go to "Credentials" tab
# - Copy "Client secret" (you'll need this next)

# 6. Create Test User
# - Navigate to: Users → Add user
# - Username: testuser
# - Email: testuser@quallaa.com
# - Click "Create"
# - Go to "Credentials" tab
# - Set password: "TestPassword123!"
# - Temporary: OFF
# - Click "Set password"
```

---

### Update Theia Cloud with Keycloak

```bash
# 1. Get Keycloak client secret from admin console
CLIENT_SECRET="<paste-client-secret-here>"

# 2. Update Theia Cloud values
cat > theia-cloud-keycloak-values.yaml <<EOF
keycloak:
  enabled: true
  authUrl: "https://auth.quallaa.com"
  realm: "quallaa"
  clientId: "theia-cloud"
  clientSecret: "$CLIENT_SECRET"
EOF

# 3. Upgrade Theia Cloud with Keycloak enabled
helm upgrade theia-cloud \
  theia-cloud-repo/theia-cloud \
  --namespace quallaa \
  -f theia-cloud-values.yaml \
  -f theia-cloud-keycloak-values.yaml

# 4. Restart pods to pick up new config
kubectl rollout restart deployment -n quallaa

# 5. Wait for pods to be ready
kubectl wait --for=condition=ready pod \
  -l app=theia-cloud \
  -n quallaa \
  --timeout=120s
```

---

### Test Authentication

```bash
# 1. Visit landing page
# https://ide.quallaa.com

# 2. Click "Launch Workspace"

# 3. You should be redirected to Keycloak login

# 4. Log in with:
# - Username: testuser
# - Password: TestPassword123!

# 5. After login, workspace should be created and you're redirected to Quallaa IDE

# 6. Verify session is tied to user
curl "https://ide.quallaa.com/api/session?user=testuser@quallaa.com&appId=$APP_ID"
```

---

## Phase 6: Custom Landing Page

The default landing page is basic. Let's create a custom one for Quallaa.

### Option A: Extend Default Landing Page

```bash
# 1. Clone Theia Cloud repo to customize landing page
git clone https://github.com/eclipse-theia/theia-cloud.git
cd theia-cloud/node/landing-page

# 2. Customize HTML/CSS
# Edit: src/index.html, src/styles.css

# 3. Build custom landing page Docker image
docker build -t ghcr.io/your-username/quallaa-landing:latest .
docker push ghcr.io/your-username/quallaa-landing:latest

# 4. Update Theia Cloud to use custom image
helm upgrade theia-cloud \
  theia-cloud-repo/theia-cloud \
  --namespace quallaa \
  --set landing.image="ghcr.io/your-username/quallaa-landing:latest" \
  --reuse-values
```

---

### Option B: Build Your Own Frontend (Recommended)

Create a modern Next.js/React frontend that calls Theia Cloud REST API.

**Architecture:**
```
quallaa.com (Marketing site - can deploy on Vercel)
    ↓
ide.quallaa.com (Theia Cloud backend + workspaces on K8s)
```

**API Integration:**

```typescript
// Example: Create session from your frontend
async function launchWorkspace(userEmail: string) {
  const response = await fetch('https://ide.quallaa.com/api/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${keycloakToken}`, // From Keycloak
    },
    body: JSON.stringify({
      appDefinition: 'quallaa',
      user: userEmail,
      appId: process.env.THEIA_CLOUD_APP_ID,
    }),
  });

  const data = await response.json();

  // Redirect user to their workspace
  window.location.href = data.sessionUrl;
}
```

This allows you to:
- Use Vercel for fast marketing site (SEO, landing pages)
- Keep IDE workspaces on Kubernetes (where they belong)
- Full branding control

---

## Phase 7: Testing & Validation

### Functional Testing

```bash
# Test 1: Create multiple sessions
for i in {1..5}; do
  curl -X POST "https://ide.quallaa.com/api/session" \
    -H "Content-Type: application/json" \
    -d "{\"appDefinition\":\"quallaa\",\"user\":\"user$i@quallaa.com\",\"appId\":\"$APP_ID\"}"
done

# Verify 5 pods are created
kubectl get pods -n quallaa | grep quallaa-user

# Test 2: Idle timeout (wait 30+ minutes)
# Verify pods are automatically terminated

# Test 3: Persistent workspace
# - Create session, upload file to workspace
# - Let session timeout
# - Create session again with same user
# - Verify file still exists

# Test 4: Resource limits
# - Launch workspace
# - Try to consume >2GB RAM (should be killed by K8s)
kubectl top pod -n quallaa  # Check resource usage
```

---

### Load Testing

```bash
# Use Apache Bench or K6 for load testing
# Test concurrent session creation

# Example with K6:
cat > load-test.js <<EOF
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 },  // Ramp to 10 users
    { duration: '5m', target: 10 },  // Stay at 10 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
};

export default function () {
  let payload = JSON.stringify({
    appDefinition: 'quallaa',
    user: \`user\${__VU}@quallaa.com\`,
    appId: '${APP_ID}',
  });

  let res = http.post('https://ide.quallaa.com/api/session', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, { 'status is 200': (r) => r.status === 200 });
}
EOF

k6 run load-test.js
```

---

## Phase 8: Production Hardening

### Security Checklist

```bash
# 1. Enable Network Policies
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-ingress
  namespace: quallaa
spec:
  podSelector: {}
  policyTypes:
  - Ingress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-ingress-to-workspaces
  namespace: quallaa
spec:
  podSelector:
    matchLabels:
      app: quallaa
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
EOF

# 2. Enable Pod Security Standards
kubectl label namespace quallaa pod-security.kubernetes.io/enforce=restricted

# 3. Create Resource Quotas
kubectl apply -f - <<EOF
apiVersion: v1
kind: ResourceQuota
metadata:
  name: quallaa-quota
  namespace: quallaa
spec:
  hard:
    requests.cpu: "10"       # Total CPU requests
    requests.memory: "20Gi"  # Total memory requests
    limits.cpu: "20"
    limits.memory: "40Gi"
    persistentvolumeclaims: "50"  # Max PVCs
    pods: "50"  # Max pods
EOF

# 4. Set up RBAC
# (Theia Cloud handles most of this, but review roles)
kubectl get roles,rolebindings -n quallaa
```

---

### Backup Strategy

```bash
# 1. Install Velero (Kubernetes backup tool)
helm repo add vmware-tanzu https://vmware-tanzu.github.io/helm-charts
helm repo update

# 2. Configure backup storage (example: S3)
helm install velero vmware-tanzu/velero \
  --namespace velero \
  --create-namespace \
  --set configuration.provider=aws \
  --set configuration.backupStorageLocation.bucket=quallaa-backups \
  --set configuration.backupStorageLocation.config.region=us-east-1 \
  --set credentials.useSecret=true \
  --set credentials.secretContents.cloud='[default]
aws_access_key_id=YOUR_KEY
aws_secret_access_key=YOUR_SECRET'

# 3. Create daily backup schedule
velero schedule create daily-backup \
  --schedule="0 2 * * *" \
  --include-namespaces quallaa

# 4. Test restore
velero backup create test-backup --include-namespaces quallaa
velero restore create --from-backup test-backup
```

---

### Monitoring Setup

```bash
# 1. Install Prometheus + Grafana
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace

# 2. Access Grafana
kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3000:80

# Visit: http://localhost:3000
# Username: admin
# Password: prom-operator

# 3. Import Kubernetes dashboards
# - Go to Dashboards → Import
# - ID: 315 (Kubernetes cluster monitoring)
# - ID: 6417 (Kubernetes pod monitoring)

# 4. Create Quallaa-specific dashboard
# Monitor:
# - Active workspace count
# - Session creation rate
# - Resource usage per workspace
# - Idle timeout events
```

---

## Monitoring & Observability

### Key Metrics to Track

```bash
# 1. Workspace count
kubectl get pods -n quallaa -l app=quallaa | wc -l

# 2. Resource usage
kubectl top pods -n quallaa

# 3. Operator health
kubectl logs -n quallaa deployment/theia-cloud-operator --tail=100

# 4. API response times
kubectl logs -n quallaa deployment/theia-cloud-service | grep "response time"

# 5. Certificate expiry
kubectl get certificate -n quallaa -o json | jq '.items[] | {name: .metadata.name, notAfter: .status.notAfter}'
```

---

### Alerting Rules

```yaml
# Example Prometheus alert rules
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: quallaa-alerts
  namespace: monitoring
spec:
  groups:
  - name: quallaa
    interval: 30s
    rules:
    - alert: HighWorkspaceCount
      expr: count(kube_pod_info{namespace="quallaa", pod=~"quallaa-.*"}) > 8
      for: 5m
      annotations:
        summary: "High workspace count (>8)"

    - alert: WorkspaceCrashLoop
      expr: rate(kube_pod_container_status_restarts_total{namespace="quallaa"}[5m]) > 0
      annotations:
        summary: "Workspace pod is crash looping"

    - alert: CertificateExpiringSoon
      expr: (certmanager_certificate_expiration_timestamp_seconds - time()) / 86400 < 7
      annotations:
        summary: "SSL certificate expiring in <7 days"
```

---

## Troubleshooting

### Common Issues

#### Issue: Pods stuck in Pending

```bash
# Check events
kubectl describe pod -n quallaa <pod-name>

# Common causes:
# - Insufficient cluster resources
kubectl top nodes

# - PVC binding issues
kubectl get pvc -n quallaa
kubectl describe pvc -n quallaa <pvc-name>

# Solution: Scale cluster or increase node size
```

---

#### Issue: SSL certificate not provisioning

```bash
# Check certificate status
kubectl get certificate -n quallaa
kubectl describe certificate -n quallaa <cert-name>

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager

# Common causes:
# - DNS not pointing to correct IP
# - Let's Encrypt rate limit (switch to staging)
# - Firewall blocking port 80 (needed for ACME challenge)

# Solution:
# Verify DNS: dig ide.quallaa.com
# Check ingress external IP matches DNS A record
```

---

#### Issue: Workspace doesn't load / white screen

```bash
# Check pod logs
kubectl logs -n quallaa <workspace-pod>

# Common causes:
# - Port mismatch (Dockerfile EXPOSE vs AppDefinition port)
# - Application crashed on startup
# - File permissions in container

# Debug interactively:
kubectl exec -it -n quallaa <workspace-pod> -- /bin/bash
ps aux
netstat -tulpn
```

---

#### Issue: Idle timeout not working

```bash
# Check monitor logs
kubectl logs -n quallaa deployment/theia-cloud-monitor

# Verify timeout configuration
kubectl get appdefinition -n quallaa quallaa -o yaml | grep timeout

# Manually trigger cleanup:
kubectl delete pod -n quallaa <idle-pod>
```

---

## Cost Optimization

### Strategies

1. **Aggressive Idle Timeout**
   ```yaml
   # In AppDefinition
   timeout: 15  # Reduce from 30 to 15 minutes
   ```

2. **Spot/Preemptible Nodes**
   ```bash
   # GKE example
   gcloud container node-pools create spot-pool \
     --cluster quallaa-prod \
     --spot \
     --machine-type e2-standard-2 \
     --num-nodes 2
   ```

3. **Cluster Autoscaler**
   ```bash
   # Already enabled in DigitalOcean/GKE examples
   # Automatically scales nodes based on demand
   ```

4. **Workspace Hibernation**
   - Save workspace state to S3
   - Terminate pod
   - Restore on next access
   - (Requires custom implementation)

5. **Shared Base Layers**
   - Use multi-stage Docker builds
   - Share node_modules across workspaces
   - Reduces storage costs

---

## Maintenance & Updates

### Update Theia Cloud

```bash
# 1. Check for new version
helm search repo theia-cloud --versions

# 2. Update Helm repo
helm repo update

# 3. Review changelog
# https://github.com/eclipse-theia/theia-cloud/releases

# 4. Upgrade Theia Cloud
helm upgrade theia-cloud \
  theia-cloud-repo/theia-cloud \
  --namespace quallaa \
  --reuse-values \
  --version <new-version>

# 5. Verify upgrade
kubectl get pods -n quallaa
kubectl logs -n quallaa deployment/theia-cloud-operator
```

---

### Update Quallaa Image

```bash
# 1. Build new version
cd /Users/jefftoffoli/Documents/GitHub/Quallaa-Native/examples/browser
docker build -t ghcr.io/your-username/quallaa:v1.1.0 .
docker push ghcr.io/your-username/quallaa:v1.1.0

# 2. Update AppDefinition
kubectl edit appdefinition -n quallaa quallaa

# Change:
# image: "ghcr.io/your-username/quallaa:latest"
# To:
# image: "ghcr.io/your-username/quallaa:v1.1.0"

# 3. Rolling restart of existing workspaces (optional)
# Users will get new version on next session

# 4. Force restart all workspaces (disruptive)
kubectl delete pods -n quallaa -l app=quallaa
```

---

### Update Kubernetes

```bash
# DigitalOcean example
doctl kubernetes cluster upgrade quallaa-prod \
  --version 1.30.0

# This takes 10-20 minutes
# Nodes are upgraded one at a time (zero downtime)
```

---

## Next Steps

Now that your Quallaa multi-tenant deployment is running:

1. **Domain-Specific Environments** (Phase 2 of roadmap)
   - Add pre-configured databases to AppDefinitions
   - Inject environment variables for APIs
   - Create templates for marketing, finance, etc.

2. **Custom Extensions**
   - Build Quallaa-specific VS Code extensions
   - Add domain-specific tooling
   - Bundle with Docker image

3. **Advanced Features**
   - Collaborative workspaces (multiple users, same workspace)
   - Workspace templates (pre-populated projects)
   - Resource usage dashboards for users

4. **Scaling**
   - Multi-region deployment
   - CDN for static assets
   - Database replication for Keycloak

---

## Support & Resources

- **Theia Cloud Docs:** https://theia-cloud.io/documentation/
- **Theia Cloud GitHub:** https://github.com/eclipse-theia/theia-cloud
- **Theia Community:** https://community.theia-ide.org/
- **Kubernetes Docs:** https://kubernetes.io/docs/
- **Helm Docs:** https://helm.sh/docs/

---

## Appendix: Quick Reference Commands

```bash
# View all resources
kubectl get all -n quallaa

# View workspaces
kubectl get pods -n quallaa -l app=quallaa

# Check operator logs
kubectl logs -n quallaa deployment/theia-cloud-operator -f

# Check service logs
kubectl logs -n quallaa deployment/theia-cloud-service -f

# Create session via API
curl -X POST "https://ide.quallaa.com/api/session" \
  -H "Content-Type: application/json" \
  -d '{"appDefinition":"quallaa","user":"user@example.com","appId":"'$APP_ID'"}'

# Delete session
curl -X DELETE "https://ide.quallaa.com/api/session/<session-name>?appId=$APP_ID"

# Force delete stuck pod
kubectl delete pod -n quallaa <pod-name> --force --grace-period=0

# Get cluster IP (for DNS)
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Restart all Theia Cloud components
kubectl rollout restart deployment -n quallaa

# Scale cluster nodes
# DigitalOcean
doctl kubernetes cluster node-pool update quallaa-prod workers --count 3

# Backup namespace
velero backup create manual-backup --include-namespaces quallaa
```

---

**End of Guide**

You now have a production-ready, multi-tenant Quallaa deployment on Kubernetes using Theia Cloud! 🎉
