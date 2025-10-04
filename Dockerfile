# -------------------------------
# Stage 1: Build
# -------------------------------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy all source files
COPY . .

# RUN npx prisma generate


# -------------------------------
# Stage 2: Production Image
# -------------------------------
FROM node:20-alpine

WORKDIR /app

# Copy only the necessary files from builder
COPY --from=builder /app /app

# Expose port (adjust if needed)
ENV PORT=8080
EXPOSE 8080

# Set environment variable for production
ENV NODE_ENV=production

# Start the server
CMD ["node", "src/index.js"]
