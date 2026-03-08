FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
COPY shared/package*.json ./shared/

RUN npm install


# Copy source code
COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev:docker", "-w", "server"]