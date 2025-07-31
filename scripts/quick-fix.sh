#!/bin/bash

# Script rápido para solucionar el problema del envsubst de una vez
echo "🔧 Solucionando problema del frontend de forma rápida..."

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Parar todo
log_info "Parando contenedores..."
docker-compose down

# Limpiar imágenes del frontend
log_info "Limpiando imagen problemática del frontend..."
docker rmi $(docker images | grep frontend | awk '{print $3}') 2>/dev/null || true

# Reconstruir solo frontend
log_info "Reconstruyendo frontend..."
docker-compose build --no-cache frontend

# Iniciar todo
log_info "Iniciando servicios..."
docker-compose up -d

# Esperar
log_info "Esperando 30 segundos..."
sleep 30

# Verificar
log_info "Verificando..."
docker-compose ps

echo ""
echo "🌐 Prueba: http://localhost:1705"
echo "🔗 Backend: http://localhost:5000/health"

# Mostrar logs del frontend
echo ""
echo "📋 Logs del frontend:"
docker-compose logs --tail=10 frontend
