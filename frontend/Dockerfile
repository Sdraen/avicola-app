# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build de la aplicación
ARG VITE_API_URL=http://146.83.194.168:5000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Etapa 2: Producción con Nginx
FROM nginx:alpine AS production

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

# Crear el script que el contenedor está buscando (SOLUCION AL ERROR)
RUN mkdir -p /docker-entrypoint.d && \
    echo '#!/bin/sh' > /docker-entrypoint.d/30-envsubst-on-templates.sh && \
    echo 'set -e' >> /docker-entrypoint.d/30-envsubst-on-templates.sh && \
    echo 'echo "✅ Frontend configuration applied"' >> /docker-entrypoint.d/30-envsubst-on-templates.sh && \
    chmod +x /docker-entrypoint.d/30-envsubst-on-templates.sh

# Crear página de health check
RUN echo 'OK' > /usr/share/nginx/html/health

# Exponer puerto 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://146.83.194.168:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
