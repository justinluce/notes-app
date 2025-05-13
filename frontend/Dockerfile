# frontend/Dockerfile

# ────────────────
# 1) BUILD STAGE
# ────────────────
FROM node:18-alpine AS builder
WORKDIR /app

# 1.1 Copy dependency manifests
COPY package*.json ./
RUN npm ci

# 1.2 Copy source & build
COPY . .
RUN npm run build

# ───────────────────
# 2) PRODUCTION STAGE
# ───────────────────
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# 2.1 Remove default content
RUN rm -rf ./*

# 2.2 Copy built assets from builder
COPY --from=builder /app/dist .

# 2.3 Expose port 80 and serve via NGINX
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]