# Multi-stage production build for RevTerm
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Build frontend
COPY client/package*.json ./client/
RUN cd client && npm ci

COPY client/ ./client/
RUN cd client && npm run build

# 2. Build server production image
FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

COPY server/ ./server/
COPY --from=builder /app/client/dist ./client/dist

ENV NODE_ENV=production
ENV PORT=5001

EXPOSE 5001

CMD ["node", "server/src/server.js"]
