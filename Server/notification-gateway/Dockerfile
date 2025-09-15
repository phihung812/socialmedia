FROM node:18-alpine

WORKDIR /notification-gateway

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]
