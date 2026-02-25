FROM node:22-alpine

# working directory
WORKDIR /app

# package files
COPY package*.json ./

# dependencies
RUN npm install

COPY . .

# app runs on port 3000
EXPOSE 3000

# dev mode (nodemon)
CMD ["npm", "run", "dev"]