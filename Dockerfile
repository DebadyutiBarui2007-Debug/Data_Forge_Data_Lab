# Multi-stage Dockerfile for Google Cloud Run deployment

# ==========================================
# STAGE 1: Build Phase
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package definition
COPY package.json ./

# Install all dependencies required for build
RUN npm install

# Copy application source files
COPY . .

# Set production env for build and bundle
ENV NODE_ENV=production
RUN npm run build

# ==========================================
# STAGE 2: Production Runtime
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package spec and built dist output
COPY package.json ./
COPY --from=builder /app/dist ./dist

# Install production dependencies only
RUN npm install --only=production --ignore-scripts

EXPOSE 3000

# Start production server
CMD ["node", "dist/server.cjs"]
