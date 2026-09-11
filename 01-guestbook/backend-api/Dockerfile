# pull base image
FROM node:lts-alpine

# Set working directory
WORKDIR /app

# copy package.json and package-lock.json into the working directory
COPY package*.json ./

# Install dependencies 
RUN npm install 

# Copy the rest of the application code into the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 4000

# Start the application

CMD ["npm", "start"]