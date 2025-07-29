# Etapa base: Node.js Alpine
FROM node:20-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y lock (si existe)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto del backend
EXPOSE 5000

# Ejecutar backend directamente con ts-node
CMD ["npx", "ts-node", "src/index.ts"]
