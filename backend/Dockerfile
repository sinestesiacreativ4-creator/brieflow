FROM node:18-alpine

WORKDIR /app

# Copy package.json and lock files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including production ones)
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript to Javascript
RUN npm run build

# Expose port (Render/Railway set PORT env var, but 3001 is fallback)
EXPOSE 3001

# Start command
CMD ["npm", "start"]
