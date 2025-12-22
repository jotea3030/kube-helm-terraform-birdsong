# Wingspan Bird Quiz - Wiz Interview Demo

> Production-grade Kubernetes deployment showcasing cloud security best practices, troubleshooting scenarios, and cost optimization.

## 🎯 Purpose

This project demonstrates skills relevant to the **Senior Solutions Support Engineer** role at Wiz:
- Cloud security posture management (CSPM) concepts
- Kubernetes expertise and troubleshooting
- Container security best practices
- Infrastructure as Code (Terraform)
- Cost-effective architecture design
- Customer-facing problem-solving scenarios

## 📋 What Wiz Cares About

### 1. **Security Posture** (What Wiz Scans)
✅ **Implemented in this project:**
- Pod Security Contexts (non-root, read-only filesystem)
- Network Policies (pod isolation)
- Resource Limits (prevent resource exhaustion)
- Workload Identity (no service account keys)
- Shielded GKE Nodes (secure boot, integrity monitoring)
- Binary Authorization ready
- Security headers in Ingress
- No privileged containers
- Capabilities dropped (ALL)

### 2. **Kubernetes Expertise**
✅ **Demonstrated:**
- Helm charts with proper templating
- Horizontal Pod Autoscaler (HPA)
- Pod Disruption Budgets (PDB)
- Health checks (liveness/readiness probes)
- Anti-affinity rules for HA
- ConfigMaps for configuration management
- Proper service mesh patterns

### 3. **Cost Optimization**
✅ **Achieved:**
- **No expensive cloud load balancer** (~$18/month saved)
- Preemptible nodes (80% cost reduction)
- Right-sized resource limits
- Auto-scaling to minimize waste
- **Total cost: ~$35-40/month**

## 🏗️ Architecture

```
┌────────────────────────────────────────┐
│      GKE Standard Cluster              │
│      (us-central1)                     │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │    Ingress-NGINX Controller      │ │
│  │    (replaces Cloud Load Balancer)│ │
│  │    NodePort: 30080               │ │
│  └────────────┬─────────────────────┘ │
│               │                        │
│  ┌────────────▼─────────────────────┐ │
│  │   Wingspan Quiz Service          │ │
│  │   - 3 replicas (HA)              │ │
│  │   - HPA: 2-5 pods                │ │
│  │   - Network Policy enabled       │ │
│  │   - Pod Security Context         │ │
│  │   - Resource limits: 200m/256Mi  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Node Pool:                            │
│  - 2 × e2-small (preemptible)         │
│  - Auto-scaling: 1-3 nodes            │
│  - Shielded nodes enabled             │
└────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
```bash
# Required tools
- gcloud CLI
- kubectl
- helm 3+
- terraform 1.0+
- docker

# Authenticate
gcloud auth login
gcloud auth application-default login
```

### Deploy Everything
```bash
# 1. Set environment variables
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"

# 2. Run deployment script
chmod +x deploy-wiz-demo.sh
./deploy-wiz-demo.sh

# Total deployment time: ~10-15 minutes
```

### Access the Application
```bash
# Option 1: Direct access via NodePort
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="ExternalIP")].address}')
echo "http://${NODE_IP}:30080"

# Option 2: Port forward for local testing
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8080:80
# Visit: http://localhost:8080
```

## 🔍 Wiz Interview Demo Scenarios

### Scenario 1: Security Audit
**Customer:** "Wiz flagged our pods as running as root. How do we fix this?"

```bash
# Show pod security context
kubectl get pods -n wingspan -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.securityContext}{"\n"}{end}'

# Verify non-root user
kubectl exec -n wingspan deployment/wingspan-quiz -- id

# Expected output: uid=101(nginx) gid=101(nginx)
```

### Scenario 2: Network Policy
**Customer:** "We need to isolate our pods. How can we control traffic?"

```bash
# View network policy
kubectl get networkpolicy -n wingspan -o yaml

# Test connectivity (should succeed)
kubectl run -it --rm debug --image=busybox --restart=Never -- \
  wget -O- http://wingspan-quiz.wingspan.svc.cluster.local

# Show ingress controller can connect
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller | grep wingspan
```

### Scenario 3: Resource Limits
**Customer:** "Our pods are consuming too much memory. How do we limit them?"

```bash
# Show current resource usage
kubectl top pods -n wingspan

# View configured limits
kubectl describe pod -n wingspan | grep -A 10 "Limits:"

# Show OOMKilled prevention
kubectl get events -n wingspan | grep OOM
```

### Scenario 4: High Availability
**Customer:** "Our app goes down during deployments. How do we ensure zero downtime?"

```bash
# Show PodDisruptionBudget
kubectl get pdb -n wingspan

# Show rolling update strategy
kubectl get deployment -n wingspan wingspan-quiz -o yaml | grep -A 5 strategy

# Trigger rolling update
kubectl set image deployment/wingspan-quiz -n wingspan \
  wingspan-quiz=us-central1-docker.pkg.dev/PROJECT/wingspan-quiz/wingspan-quiz:new-version

# Watch pods during update (should maintain minAvailable)
kubectl get pods -n wingspan -w
```

### Scenario 5: Auto-Scaling
**Customer:** "How does our app handle traffic spikes?"

```bash
# View HPA configuration
kubectl get hpa -n wingspan
kubectl describe hpa -n wingspan wingspan-quiz

# Simulate load
kubectl run -it --rm load-generator --image=busybox --restart=Never -- \
  /bin/sh -c "while true; do wget -q -O- http://wingspan-quiz.wingspan.svc.cluster.local; done"

# Watch pods scale up
watch kubectl get hpa -n wingspan
watch kubectl get pods -n wingspan
```

### Scenario 6: Troubleshooting Failed Pods
**Customer:** "Pods are in CrashLoopBackOff. Help!"

```bash
# View pod status
kubectl get pods -n wingspan

# Check events
kubectl get events -n wingspan --sort-by='.lastTimestamp'

# View logs
kubectl logs -n wingspan deployment/wingspan-quiz --tail=50

# Describe problematic pod
kubectl describe pod -n wingspan POD_NAME

# Check resource pressure
kubectl top nodes
kubectl describe node NODE_NAME | grep -A 5 "Allocated resources"
```

### Scenario 7: Security Compliance Check
**Customer:** "We need to pass SOC 2 compliance. Show us your security posture."

```bash
# 1. Verify Workload Identity
kubectl get serviceaccount -n wingspan wingspan-quiz -o yaml

# 2. Check for privileged containers (should be none)
kubectl get pods -n wingspan -o json | \
  jq '.items[].spec.containers[].securityContext.privileged'

# 3. Verify capabilities are dropped
kubectl get pods -n wingspan -o json | \
  jq '.items[].spec.containers[].securityContext.capabilities'

# 4. Check network policies
kubectl get networkpolicies -n wingspan

# 5. Verify resource limits (prevent DoS)
kubectl get pods -n wingspan -o json | \
  jq '.items[].spec.containers[].resources'

# 6. Check image vulnerability scanning
gcloud artifacts docker images describe \
  us-central1-docker.pkg.dev/PROJECT/wingspan-quiz/wingspan-quiz:latest \
  --show-all-metadata
```

## 📊 Cost Breakdown

| Resource | Configuration | Monthly Cost |
|----------|---------------|--------------|
| GKE Control Plane | Standard, Regional | $73 |
| Worker Nodes | 2 × e2-small preemptible | $26 |
| Persistent Disks | 20GB standard | $2 |
| Network Egress | ~10GB | $1 |
| Artifact Registry | 2GB storage | $0.20 |
| **Total** | | **~$35-40** |

### Cost Savings vs. Alternatives
- **vs. Cloud Load Balancer:** Save $18/month (uses Ingress-NGINX)
- **vs. GKE Autopilot:** Save $20/month (Standard + preemptible)
- **vs. Non-preemptible:** Save $100/month (80% node cost reduction)

## 🛡️ Security Features

### Pod-Level Security
```yaml
# Every pod in this deployment has:
securityContext:
  runAsNonRoot: true
  runAsUser: 101
  allowPrivilegeEscalation: false
  capabilities:
    drop: [ALL]
  seccompProfile:
    type: RuntimeDefault
```

### Network-Level Security
```yaml
# NetworkPolicy restricts:
- Ingress: Only from ingress-nginx namespace
- Egress: DNS + HTTPS API calls only
```

### Infrastructure-Level Security
- ✅ Shielded GKE nodes (secure boot + integrity monitoring)
- ✅ Workload Identity (no service account key files)
- ✅ Binary Authorization ready
- ✅ VPC with custom subnets (not default)
- ✅ Minimal node IAM permissions

## 🔧 Troubleshooting Commands

### Common Issues

**Issue: Pods pending**
```bash
kubectl describe pod -n wingspan POD_NAME
kubectl get events -n wingspan
kubectl top nodes
```

**Issue: Ingress not working**
```bash
kubectl get ingress -n wingspan
kubectl describe ingress -n wingspan wingspan-quiz
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

**Issue: High memory usage**
```bash
kubectl top pods -n wingspan
kubectl describe pod -n wingspan POD_NAME | grep -A 5 "Limits"
kubectl get hpa -n wingspan
```

**Issue: Network connectivity**
```bash
kubectl get networkpolicy -n wingspan
kubectl run -it --rm debug --image=nicolaka/netshoot -- /bin/bash
# Inside pod: curl http://wingspan-quiz.wingspan.svc.cluster.local
```

## 📈 Monitoring & Observability

### Built-in Metrics
```bash
# Node metrics
kubectl top nodes

# Pod metrics
kubectl top pods -n wingspan

# HPA status
kubectl get hpa -n wingspan -w

# Resource usage over time
kubectl describe node | grep -A 5 "Allocated resources"
```

### Logs
```bash
# Application logs
kubectl logs -n wingspan deployment/wingspan-quiz -f

# Ingress logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller -f

# All events
kubectl get events -n wingspan --sort-by='.lastTimestamp'
```

## 🧪 Load Testing

```bash
# Install hey (HTTP load generator)
go install github.com/rakyll/hey@latest

# Run load test
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="ExternalIP")].address}')
hey -n 10000 -c 100 -q 10 http://${NODE_IP}:30080

# Watch scaling
watch kubectl get hpa -n wingspan
watch kubectl get pods -n wingspan
```

## 🧹 Cleanup

```bash
# Destroy everything
cd terraform
terraform destroy -var="project_id=${GCP_PROJECT_ID}" -var="region=${GCP_REGION}" -auto-approve

# Delete state bucket
gsutil rm -r gs://wingspan-wiz-demo-tfstate
```

## 📚 Interview Talking Points

### Why This Architecture?
1. **Cost-effective:** ~$35/month vs $150+ for typical K8s setup
2. **Production-ready:** HA, auto-scaling, security hardened
3. **Maintainable:** IaC, Helm charts, documented patterns
4. **Secure:** Follows CIS Kubernetes benchmarks
5. **Observable:** Metrics, logs, health checks

### Wiz Integration Points
- **CSPM:** Scans for misconfigurations (privileged pods, etc.)
- **CWPP:** Runtime protection, image scanning
- **CIEM:** Workload identity, IAM permissions
- **Network Segmentation:** NetworkPolicy violations
- **Compliance:** CIS benchmarks, SOC 2, PCI-DSS

### Customer Scenarios You Can Demo
1. Security audit findings resolution
2. Pod scheduling and resource issues
3. Network connectivity troubleshooting
4. High availability validation
5. Performance optimization
6. Cost analysis and reduction

## 🎯 Next Steps for Interview

1. **Deploy this architecture** (~15 minutes)
2. **Practice scenarios** above
3. **Be ready to explain:**
   - Why Ingress-NGINX vs Cloud LB?
   - How does HPA work?
   - What happens during a node failure?
   - How would you debug X issue?
4. **Bonus:** Add Prometheus/Grafana for monitoring

## 📞 Support

For interview prep questions or architecture decisions, this project demonstrates:
- ✅ Real-world K8s patterns
- ✅ Security best practices
- ✅ Cost optimization
- ✅ Troubleshooting methodologies
- ✅ Customer-facing communication

Good luck with your Wiz interview! 🚀
