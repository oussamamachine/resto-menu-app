# Multi-stage Dockerfile to build client and run server

FROM node:18-alpine AS builder
WORKDIR /app

# Copy root files
COPY package.json package-lock.json ./

# Copy subprojects
COPY client/package.json client/package-lock.json ./client/
COPY server/package.json server/package-lock.json ./server/

# Install client deps and build
WORKDIR /app/client
RUN npm ci && npm run build

# Install server deps
WORKDIR /app/server
RUN npm ci

# Runtime image
FROM node:18-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Copy server source
COPY --from=builder /app/server /app/server
# Copy built client into server/../client/dist for static serving
COPY --from=builder /app/client/dist /app/client/dist

WORKDIR /app/server
EXPOSE 5000
CMD ["node", "server.js"]
