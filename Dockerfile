# Use node
FROM node:boron

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and install depandancies
COPY package.json .
RUN npm install

# Copy app source
COPY . .

# Expose port used by app, and run it
EXPOSE 8080
CMD ["npm", "run", "start:dev"]