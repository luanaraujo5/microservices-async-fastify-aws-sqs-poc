FROM node:20-alpine

WORKDIR /usr/src/app

# Instala tudo (prod + dev)
COPY package*.json ./
RUN npm install

# Copia o resto do código
COPY . .

# Expõe a porta de desenvolvimento
EXPOSE 3000

# Roda em modo dev (hot-reload)
CMD ["npm", "run", "dev"]
