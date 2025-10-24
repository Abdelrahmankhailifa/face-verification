FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create models directory
RUN mkdir -p models

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]
