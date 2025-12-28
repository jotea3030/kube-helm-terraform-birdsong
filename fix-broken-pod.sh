# Update the image only
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
IMAGE_NAME="us-central1-docker.pkg.dev/kube-helm-terraform-birdsong/wingspan-quiz/wingspan-quiz"

# Build and push
docker build -t ${IMAGE_NAME}:${TIMESTAMP} .
docker push ${IMAGE_NAME}:${TIMESTAMP}

# Update Helm release
helm upgrade wingspan-quiz ./helm/wingspan-quiz \
  --namespace wingspan \
  --set image.repository=${IMAGE_NAME} \
  --set image.tag=${TIMESTAMP} \
  --reuse-values

# Delete the bad pod
kubectl delete rs wingspan-quiz-69d499f758 -n wingspan
