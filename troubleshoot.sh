# 1. Check what's wrong with the image
kubectl describe pod wingspan-quiz-69d499f758-nt4kq -n wingspan | grep -A 10 "Events:"

# 2. Check the deployment configuration
kubectl get deployment wingspan-quiz -n wingspan -o yaml | grep image:

# 3. See all replica sets (the old one might have bad image)
kubectl get rs -n wingspan

# 4. Fix: Delete the bad replica set
kubectl delete rs wingspan-quiz-69d499f758 -n wingspan

# 5. Verify only good pods remain
kubectl get pods -n wingspan
