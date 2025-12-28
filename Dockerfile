# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm install

# Copy source code
COPY src ./src
COPY public ./public

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Create necessary directories and set permissions
# Note: nginx:alpine already has the nginx user (uid 101)
RUN mkdir -p /var/cache/nginx /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    # Create temp directories for nginx with proper permissions
    mkdir -p /tmp/client_temp /tmp/proxy_temp_path /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp && \
    chown -R nginx:nginx /tmp/client_temp /tmp/proxy_temp_path /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder --chown=nginx:nginx /app/build /usr/share/nginx/html

# Ensure nginx owns the config file
RUN chown nginx:nginx /etc/nginx/nginx.conf

# Switch to nginx user
USER nginx

# Expose non-privileged port
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

