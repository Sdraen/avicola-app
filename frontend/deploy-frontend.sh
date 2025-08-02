#!/bin/bash

echo "🔧 Construyendo frontend con Vite..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Error al compilar el frontend. Abortando."
  exit 1
fi

echo "🧹 Limpiando HTML anterior..."
sudo rm -rf /usr/share/nginx/html/*

echo "📦 Copiando archivos compilados a NGINX..."
sudo cp -r dist/* /usr/share/nginx/html/

echo "🔁 Recargando NGINX..."
sudo nginx -t && sudo nginx -s reload

echo "✅ ¡Despliegue completo! Abre http://146.83.198.35:1705"
