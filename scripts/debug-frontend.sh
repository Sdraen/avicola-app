#!/bin/bash

# Script para debuggear problemas específicos del frontend
echo "🔍 Diagnosticando problemas del frontend..."

echo "📊 Estado de contenedores:"
docker-compose ps

echo ""
echo "📋 Logs recientes del frontend:"
docker-compose logs --tail=50 frontend

echo ""
echo "🌐 Probando conectividad:"
echo "- Health endpoint:"
curl -v http://localhost:1705/health 2>&1 || echo "Falló"

echo ""
echo "- Página principal:"
curl -I http://localhost:1705 2>&1 || echo "Falló"

echo ""
echo "🐳 Información del contenedor:"
docker inspect sistema-avicola-frontend | grep -A 5 -B 5 "Health\|Status\|State"

echo ""
echo "📁 Archivos en el contenedor:"
docker exec sistema-avicola-frontend ls -la /usr/share/nginx/html/ 2>/dev/null || echo "No se pudo acceder al contenedor"

echo ""
echo "🔧 Configuración de Nginx:"
docker exec sistema-avicola-frontend cat /etc/nginx/conf.d/default.conf 2>/dev/null || echo "No se pudo leer configuración"
