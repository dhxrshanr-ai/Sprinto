## Backend Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Remove frontend client folder if present (not needed in backend image)
RUN rm -rf client

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "server.js"]
