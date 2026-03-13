# ---------- Build Stage ----------
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Build the Vite app
RUN npm run build


# ---------- Production Stage ----------
FROM nginx:alpine

# Install envsubst (needed for env variable substitution)
RUN apk add --no-cache gettext

# Copy built site to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy runtime env template
COPY public/env.template.js /usr/share/nginx/html/env.template.js

# Copy startup script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Cloud Run requires port 8080
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf

EXPOSE 8080

# Use entrypoint script
ENTRYPOINT ["/entrypoint.sh"]