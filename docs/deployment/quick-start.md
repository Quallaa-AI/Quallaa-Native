# Quallaa Multi-Tenant Deployment: Quick Start

**TL;DR:** Use Theia Cloud (free, open-source) on Kubernetes to deploy Quallaa as a multi-tenant SaaS.

---

## 🚀 Fastest Path to Production

### For Local Testing (0 cost, 2-3 hours)

```bash
# 1. Start Minikube
minikube start --cpus=4 --memory=8192
minikube addons enable ingress

# 2. Install Theia Cloud
helm repo add theia-cloud-repo https://eclipse-theia.github.io/theia-cloud-helm/
helm repo update

helm install theia-cloud-base theia-cloud-repo/theia-cloud-base \
  --set issuer.email=your@email.com

kubectl create namespace quallaa
helm install -n quallaa theia-cloud-crds theia-cloud-repo/theia-cloud-crds
helm install -n quallaa theia-cloud theia-cloud-repo/theia-cloud \
  --set appId=$(uuidgen) \
  --set hosts.configuration.baseHost="ide.quallaa.local"

# 3. Build & deploy Quallaa
cd examples/browser
docker build -t quallaa:latest .

# Create AppDefinition (see full guide for YAML)
kubectl apply -f quallaa-app-definition.yaml

# 4. Test it
# Visit http://ide.quallaa.local
```

**Time to first workspace:** ~3 hours
**Cost:** $0

---

### For Production (DigitalOcean, 1-2 days)

```bash
# 1. Create Kubernetes cluster
doctl kubernetes cluster create quallaa-prod \
  --region nyc1 \
  --node-pool "name=workers;size=s-2vcpu-4gb;count=2;auto-scale=true;min-nodes=2;max-nodes=5"

# 2. Install dependencies
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml

helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace

# Get external IP for DNS
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Point DNS: ide.quallaa.com → EXTERNAL-IP

# 3. Install Theia Cloud (same as local, but use real domain)
helm install theia-cloud-base theia-cloud-repo/theia-cloud-base \
  --set issuer.email=devops@quallaa.com \
  --set issuer.name=letsencrypt-prod

kubectl create namespace quallaa
helm install -n quallaa theia-cloud-crds theia-cloud-repo/theia-cloud-crds
helm install -n quallaa theia-cloud theia-cloud-repo/theia-cloud \
  --set appId=$(uuidgen) \
  --set hosts.configuration.baseHost="ide.quallaa.com" \
  --set ingress.clusterIssuer="letsencrypt-prod"

# 4. Build & push Quallaa image
docker build -t ghcr.io/yourorg/quallaa:latest examples/browser
docker push ghcr.io/yourorg/quallaa:latest

# 5. Deploy AppDefinition
kubectl apply -f quallaa-app-definition.yaml

# 6. Add authentication (Keycloak)
helm install keycloak bitnami/keycloak --namespace auth --create-namespace
# Configure realm & client (see full guide)

# Upgrade Theia Cloud with Keycloak
helm upgrade theia-cloud theia-cloud-repo/theia-cloud -n quallaa \
  --set keycloak.enabled=true \
  --set keycloak.authUrl="https://auth.quallaa.com" \
  --set keycloak.realm="quallaa" \
  --set keycloak.clientId="theia-cloud"
```

**Time to production:** 1-2 days
**Cost:** ~$120-150/month (scales with usage)

---

## 📊 What You Get

**Infrastructure (Provided by Theia Cloud):**
- ✅ Multi-tenant orchestration (container-per-user)
- ✅ Session lifecycle management (create/stop/delete)
- ✅ Idle timeout (auto-shutdown after 30 min)
- ✅ Activity monitoring
- ✅ Resource limits & quotas
- ✅ REST API for integration
- ✅ Sample landing page

**What You Build:**
- ❌ Quallaa Docker image (4 hours first time)
- ❌ Authentication setup (2-4 hours)
- ❌ Custom landing page UI (optional, 1-2 weeks)
- ❌ DNS & SSL configuration (1 hour)

**Time saved by using Theia Cloud:** 6-10 weeks of custom development

---

## 💰 Cost Breakdown (100 users, 30% concurrency)

| Component | Monthly Cost |
|-----------|-------------|
| DigitalOcean K8s (2-5 nodes) | $96-240 |
| Persistent storage (50GB) | $5-10 |
| Load Balancer | Included |
| Egress bandwidth | ~$10-20 |
| **Total** | **$111-270** |

**Per-user cost:** ~$1.11-2.70/month

Scales down to near-zero with idle timeout (users only cost $ when active).

---

## 🗺️ Deployment Decision Tree

**Start Here:** Do you have Kubernetes experience?

### YES → Deploy Theia Cloud Directly
- **Timeline:** 5-7 days to production
- **Platform:** DigitalOcean K8s or GKE
- **Cost:** $100-150/month
- **Benefit:** Production-ready from day 1

**Steps:**
1. Day 1: Set up K8s cluster
2. Day 2: Install Theia Cloud
3. Day 3-4: Build Quallaa image, deploy AppDefinition
4. Day 5: Set up Keycloak auth
5. Day 6-7: Testing & DNS/SSL

---

### NO → Start with Minikube, Then Migrate
- **Timeline:** 1 week learning + 1 week production
- **Platform:** Local → Cloud
- **Cost:** $0 → $100-150/month
- **Benefit:** Learn without spending

**Steps:**
1. Week 1: Follow Minikube path (local laptop)
2. Learn K8s basics, test Theia Cloud
3. Week 2: Migrate to DigitalOcean K8s
4. Same Helm commands, just different cluster

---

### ALTERNATIVE: Not Ready for K8s Yet?
- **Timeline:** 2-3 weeks
- **Platform:** Render or Railway
- **Cost:** $50-150/month
- **Benefit:** Simpler, but custom multi-tenancy code required

**Trade-off:** You'll build multi-tenancy yourself (see investigation findings doc).

---

## 🔧 Essential Commands

```bash
# View workspaces
kubectl get pods -n quallaa -l app=quallaa

# Check operator logs
kubectl logs -n quallaa deployment/theia-cloud-operator -f

# Create session via API
curl -X POST "https://ide.quallaa.com/api/session" \
  -H "Content-Type: application/json" \
  -d '{"appDefinition":"quallaa","user":"user@example.com","appId":"YOUR_APP_ID"}'

# Watch workspace start
kubectl get pods -n quallaa -w

# Restart Theia Cloud
kubectl rollout restart deployment -n quallaa

# Scale cluster
doctl kubernetes cluster node-pool update quallaa-prod workers --count 3
```

---

## 🐛 Common Issues

**Issue:** SSL certificate not working
**Fix:** Verify DNS points to correct IP, wait 10-60 min for propagation
```bash
kubectl get certificate -n quallaa
kubectl logs -n cert-manager deployment/cert-manager
```

**Issue:** Workspace pod stuck in Pending
**Fix:** Insufficient resources, scale cluster
```bash
kubectl describe pod -n quallaa <pod-name>
kubectl top nodes
```

**Issue:** Workspace doesn't load (white screen)
**Fix:** Check port matches (3000), view logs
```bash
kubectl logs -n quallaa <workspace-pod>
```

---

## 📚 Full Documentation

- **Complete Guide:** `DEPLOYMENT-THEIA-CLOUD.md` (this repo)
- **Theia Cloud Docs:** https://theia-cloud.io/documentation/
- **Investigation Findings:** Earlier in this conversation

---

## ✅ Production Checklist

Before going live:

- [ ] DNS configured and propagated
- [ ] SSL certificates issued (Let's Encrypt)
- [ ] Keycloak authentication working
- [ ] Resource limits set in AppDefinition
- [ ] Network policies enabled
- [ ] Backup strategy configured (Velero)
- [ ] Monitoring set up (Prometheus + Grafana)
- [ ] Load tested (10+ concurrent users)
- [ ] Idle timeout tested (workspaces auto-stop)
- [ ] Custom landing page deployed (or default styled)

---

## 🎯 Next Steps

**Today:**
1. Read full guide: `DEPLOYMENT-THEIA-CLOUD.md`
2. Choose platform: Minikube (test) or DigitalOcean (prod)
3. Install prerequisites (kubectl, helm, docker)

**This Week:**
1. Set up Kubernetes cluster
2. Install Theia Cloud via Helm
3. Deploy test Quallaa workspace

**Next Week:**
1. Add authentication (Keycloak)
2. Custom landing page
3. Invite beta users

**This Month:**
1. Monitor usage patterns
2. Optimize resource limits
3. Plan domain-specific environments (Phase 2)

---

**Questions?**
- Theia Community: https://community.theia-ide.org/
- Theia Cloud Issues: https://github.com/eclipse-theia/theia-cloud/issues

---

**You're not building multi-tenancy from scratch. You're deploying existing infrastructure.** 🚀
