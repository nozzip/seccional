# Imagen base liviana de Node.js en Alpine / Debian Slim
FROM node:20-bullseye-slim

WORKDIR /app

# Instalar dependencias del sistema requeridas para sockets y compilación nativa ligera
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copiar definiciones de paquetes
COPY package*.json ./

# Instalar dependencias de producción y desarrollo para compilar TypeScript
RUN npm install

# Copiar el código fuente
COPY . .

# Compilar TypeScript a JavaScript en /dist
RUN npm run build

# Exponer el puerto del servidor HTTP
EXPOSE 3008

# Variables por defecto
ENV PORT=3008
ENV NODE_ENV=production

# Comando de inicio
CMD ["npm", "start"]
