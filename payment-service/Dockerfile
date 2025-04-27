FROM node:20-alpine

WORKDIR /usr/src/app

# Instala tudo (prod + dev)
COPY package*.json ./
RUN npm install

# Copia o resto do código
COPY . .

# Não expõe porta (é wrker)
# Roda o consumer em modo dev (hot-reload)
CMD ["npm", "run", "dev"]
