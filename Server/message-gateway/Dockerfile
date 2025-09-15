FROM node:18-alpine

WORKDIR /message-gateway

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]
