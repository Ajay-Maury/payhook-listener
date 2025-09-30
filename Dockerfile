# ---------------- Builder stage ----------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (npm ci uses package-lock.json)
RUN npm ci

# Copy all files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build NestJS app
RUN npm run build


# ---------------- Production stage ----------------
FROM node:20-alpine AS runner

WORKDIR /app

# Copy artifacts from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/prisma ./prisma

# Expose NestJS port
EXPOSE 3000

# Run Prisma migrations before starting app
CMD ["npm", "run", "start:migrate:prod"]
