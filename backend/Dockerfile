# Multi-stage Dockerfile cho Backend API
# Phụ trách: Hoàng Huy (hoanghuy216412@gmail.com)

# Stage 1: Build mã nguồn TypeScript
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Stage 2: Môi trường chạy tối ưu và bảo mật
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/docs ./src/docs

USER node
EXPOSE 5000

HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=15s \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "dist/server.js"]
