cat > deploy-wiz-demo.sh << 'EOF'
#!/bin/bash
# deploy-wiz-demo.sh
# Complete deployment script for Wiz interview demo

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🦅 Wingspan Quiz - Wiz Interview Demo Deployment${NC}"
echo "=================================================="

# Configuration
export PROJECT_ID=${GCP_PROJECT_ID:-"kube-helm-terraform-birdsong"}
export REGION=${GCP_REGION:-"us-central1"}
export CLUSTER_NAME="wingspan-cluster"

echo -e "\n${BLUE}📋 Configuration:${NC}"
echo "Project: ${PROJECT_ID}"
echo "Region: ${REGION}"
echo "Cluster: ${CLUSTER_NAME}"

# Step 1: Build and push Docker image
echo -e "\n${GREEN}Step 1: Building and pushing Docker image...${NC}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/wingspan-quiz/wingspan-quiz"

docker build -t ${IMAGE_NAME}:${TIMESTAMP} .
docker tag ${IMAGE_NAME}:${TIMESTAMP} ${IMAGE_NAME}:latest

docker push ${IMAGE_NAME}:${TIMESTAMP}
docker push ${IMAGE_NAME}:latest

echo -e "${GREEN}✅ Image pushed: ${IMAGE_NAME}:${TIMESTAMP}${NC}"

# Step 2: Create Terraform backend bucket if doesn't exist
echo -e "\n${GREEN}Step 2: Setting up Terraform backend...${NC}"
BUCKET_NAME="wingspan-wiz-demo-tfstate-${PROJECT_ID}"

if ! gsutil ls -b gs://${BUCKET_NAME} &>/dev/null; then
    gsutil mb -p ${PROJECT_ID} -l ${REGION} gs://${BUCKET_NAME}
    gsutil versioning set on gs://${BUCKET_NAME}
    echo -e "${GREEN}✅ Created state bucket: ${BUCKET_NAME}${NC}"
else
    echo -e "${YELLOW}Bucket already exists: ${BUCKET_NAME}${NC}"
fi

# Update backend config
cat > terraform/backend.tf <<BACKEND
terraform {
  backend "gcs" {
    bucket = "${BUCKET_NAME}"
    prefix = "terraform/state"
  }
}
BACKEND

# Step 3: Deploy infrastructure with Terraform
echo -e "\n${GREEN}Step 3: Deploying GKE cluster with Terraform...${NC}"
cd terraform

terraform init

echo -e "${YELLOW}This will create:${NC}"
echo "  - GKE Standard cluster (2 e2-small nodes)"
echo "  - VPC with custom subnets"
echo "  - Ingress-NGINX controller"
echo "  - Cost: ~$35-40/month"
echo ""
read -p "Continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

terraform apply \
  -var="project_id=${PROJECT_ID}" \
  -var="region=${REGION}" \
  -auto-approve

cd ..

# Step 4: Configure kubectl
echo -e "\n${GREEN}Step 4: Configuring kubectl...${NC}"
gcloud container clusters get-credentials ${CLUSTER_NAME} \
  --region ${REGION} \
  --project ${PROJECT_ID}

kubectl cluster-info

# Step 5: Wait for Ingress-NGINX to be ready
echo -e "\n${GREEN}Step 5: Waiting for Ingress-NGINX...${NC}"
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s

echo -e "${GREEN}✅ Ingress-NGINX is ready${NC}"

# Step 6: Deploy application with Helm
echo -e "\n${GREEN}Step 6: Deploying Wingspan Quiz with Helm...${NC}"

# Create namespace
kubectl create namespace wingspan --dry-run=client -o yaml | kubectl apply -f -

# Deploy with Helm
helm upgrade --install wingspan-quiz ./helm/wingspan-quiz \
  --namespace wingspan \
  --set image.repository=${IMAGE_NAME} \
  --set image.tag=${TIMESTAMP} \
  --wait \
  --timeout 5m

echo -e "${GREEN}✅ Application deployed${NC}"

# Step 7: Get access information
echo -e "\n${GREEN}Step 7: Getting access information...${NC}"

# Get node external IPs
NODE_IPS=$(kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="ExternalIP")].address}')

if [ -z "$NODE_IPS" ]; then
    echo -e "${YELLOW}⚠️  No external IPs found. Getting internal IPs...${NC}"
    NODE_IPS=$(kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="InternalIP")].address}')
fi

# Get the first node IP
NODE_IP=$(echo $NODE_IPS | awk '{print $1}')

# Deployment summary
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}================================================${NC}"

echo -e "\n${BLUE}📊 Cluster Information:${NC}"
kubectl get nodes
echo ""
kubectl get pods -n wingspan
echo ""
kubectl get svc -n ingress-nginx

echo -e "\n${BLUE}🌐 Access Information:${NC}"
echo -e "Node IP: ${NODE_IP}"
echo -e "NodePort HTTP: 30080"
echo -e "NodePort HTTPS: 30443"
echo ""
echo -e "${YELLOW}Access your application:${NC}"
echo -e "  http://${NODE_IP}:30080"
echo ""
echo -e "${YELLOW}Or use port-forward for local testing:${NC}"
echo -e "  kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8080:80"
echo -e "  Then visit: http://localhost:8080"

echo -e "\n${BLUE}🔍 Wiz Demo Commands:${NC}"
echo -e "${YELLOW}Check security posture:${NC}"
echo "  kubectl get networkpolicies -n wingspan"
echo "  kubectl describe pod -n wingspan | grep -A 5 'Security Context'"
echo ""
echo -e "${YELLOW}View resource limits:${NC}"
echo "  kubectl top nodes"
echo "  kubectl top pods -n wingspan"
echo ""
echo -e "${YELLOW}Check HPA (autoscaling):${NC}"
echo "  kubectl get hpa -n wingspan"
echo ""
echo -e "${YELLOW}View logs:${NC}"
echo "  kubectl logs -n wingspan -l app.kubernetes.io/name=wingspan-quiz"

echo -e "\n${BLUE}💰 Cost Estimate:${NC}"
echo "  Control Plane: ~\$73/month"
echo "  Worker Nodes: 2 × \$13/month = \$26/month"
echo "  Storage & Network: ~\$5/month"
echo "  ${GREEN}Total: ~\$35-40/month${NC}"

echo -e "\n${BLUE}🧹 Cleanup Command:${NC}"
echo "  terraform destroy -var=\"project_id=${PROJECT_ID}\" -var=\"region=${REGION}\""

echo -e "\n${GREEN}Happy interviewing! 🎉${NC}"
EOF

# Make it executable
chmod +x deploy-wiz-demo.sh

echo "✅ Created deploy-wiz-demo.sh"
