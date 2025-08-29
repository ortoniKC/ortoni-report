# Use Node.js LTS base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package and lock files
COPY package*.json ./

# Install all dependencies including devDependencies for build
RUN npm install

# Copy the rest of the application
COPY . .

# Build the project (output will go to /app/dist)
RUN npm run build

# Set CLI binary in PATH
RUN npm link

# Default command when container runs
ENTRYPOINT ["ortoni-report"]
