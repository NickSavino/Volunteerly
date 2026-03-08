FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
COPY shared/package*.json ./shared/

RUN npm install

COPY . .

WORKDIR /app/client

EXPOSE 3000

CMD ["npm", "run", "dev"]