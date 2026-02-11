# Base stage
FROM node:20-alpine AS base

# Builder stage
FROM base AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
# Install all dependencies (including devDependencies for building)
RUN npm ci
COPY . .
# Generate Prisma Client
RUN npx prisma generate
# Build the TypeScript application
RUN npm run build

# Runner stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy package.json and prisma schema
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Generate Prisma Client for production environment
RUN npx prisma generate

# Change ownership to non-root user
# Note: creating directory permissions if they don't exist
RUN chown -R expressjs:nodejs /app

USER expressjs

EXPOSE 3000

CMD ["npm", "start"]
