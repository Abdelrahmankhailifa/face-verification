# Simple Node.js image for face verification
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --production

# Copy source code
COPY . .

# Create models directory
RUN mkdir -p models

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]
