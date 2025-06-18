#!/bin/bash

# Script de despliegue para servidor universitario (backend y frontend) usando npm run dev/start
set -e

echo "🚀 Iniciando despliegue del Sistema Avícola IECI..."

# 1. Iniciar el frontend en modo desarrollo
echo "📦 Iniciando frontend (npm run dev)..."
cd frontend
npm install
npm run dev &   # se ejecuta en segundo plano
cd ..

# 2. Iniciar el backend
echo "🔧 Iniciando backend (npm run start)..."
cd backend
npm install
npm run start &  # se ejecuta en segundo plano
cd ..

# 3. Preparar carpeta de despliegue
echo "📁 Preparando carpeta deploy..."
DEPLOY_DIR=deploy
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR/backend"
mkdir -p "$DEPLOY_DIR/frontend"

# Copiar archivos al despliegue
echo "   > Copiando backend a $DEPLOY_DIR/backend..."
cp -r backend/* "$DEPLOY_DIR/backend/"

echo "   > Copiando frontend a $DEPLOY_DIR/frontend..."
cp -r frontend/* "$DEPLOY_DIR/frontend/"

# 4. (Opcional) Configurar PM2 para backend si se prefiere
echo "# Para usar PM2: pm2 start $DEPLOY_DIR/backend/index.ts --name sistema-avicola-backend"

# 5. (Opcional) Configurar Nginx si se dispone de build
echo "# Configuración Nginx lista en $DEPLOY_DIR/nginx.conf (si aplica)"

# 6. Finalización
echo "✅ Despliegue preparado."
echo "   - Backend: $DEPLOY_DIR/backend"
echo "   - Frontend: $DEPLOY_DIR/frontend"
echo "   Asegúrate de revisar logs y permisos según sea necesario."
```
