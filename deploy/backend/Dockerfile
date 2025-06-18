FROM node:20

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar solo los archivos necesarios
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código (carpetas controllers, models, routes, services, etc.)
COPY . .

# Exponer el puerto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]
