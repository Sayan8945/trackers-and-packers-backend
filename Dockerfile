FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps
COPY --from=builder /app/dist ./dist

# Create logs dir and hand ownership to the non-root node user
# (only needed for local Docker runs; Railway uses console-only logging)
RUN mkdir -p logs && chown -R node:node /app

EXPOSE 5000
USER node
CMD ["node", "dist/server.js"]
