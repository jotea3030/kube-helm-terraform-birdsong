# Get the node's external IP
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="ExternalIP")].address}')

# If no external IP, get internal IP
if [ -z "$NODE_IP" ]; then
    NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
    echo "Using internal IP (may not be accessible from outside): $NODE_IP"
else
    echo "Using external IP: $NODE_IP"
fi

# Access via NodePort 30080
echo "Access your app at: http://${NODE_IP}:30080"

# Open in browser
open "http://${NODE_IP}:30080"  # macOS
# or just visit the URL manually
