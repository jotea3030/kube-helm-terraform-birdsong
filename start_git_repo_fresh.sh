# 1. Back up your current work
cp -r ../kube-helm-terraform-birdsong ../kube-helm-terraform-birdsong-backup

# 2. Remove git history completely
rm -rf .git

# 3. Remove large directories
rm -rf node_modules/
rm -rf terraform/.terraform/
rm -rf build/

# 4. Create .gitignore first
cat > .gitignore << 'EOF'
# Node.js
node_modules/
npm-debug.log*
package-lock.json

# Build
build/
dist/

# Terraform
terraform/.terraform/
terraform/.terraform.lock.hcl
terraform/*.tfstate*
terraform/terraform.tfvars
terraform/backend.tf
**/.terraform/

# Environment
.env*
*-key.json

# OS/IDE
.DS_Store
.vscode/
.idea/
*.swp

# Logs
*.log
EOF

# 5. Initialize fresh git repo
git init
git add .
git commit -m "Initial commit - Wingspan Bird Quiz for Wiz.io interview"

# 6. Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/wingspan-bird-quiz.git
git branch -M main
git push -u origin main
