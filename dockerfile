# Use official Node.js runtime as a parent image
FROM node:18

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first (for caching npm install)
COPY package*.json ./
COPY .env ./

# Install dependencies
RUN npm install 

# Copy the rest of the app source code
COPY . .

# Expose the port your Express app runs on
EXPOSE 3000

# Run the application
CMD ["node", "server"]
