# Use Node.js 22 LTS Alpine image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci || npm install

# Copy application source code
COPY . .

# Build production assets (Vite frontend build + TypeScript check)
RUN npm run build

# Expose server port
EXPOSE 3000

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start production server
CMD ["npm", "start"]
