#!/bin/bash

# Script para solucionar el error de build específico
echo "🔧 Solucionando error de build..."

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Verificar estructura de archivos
log_info "Verificando estructura de archivos..."
echo "📁 Estructura actual:"
ls -la
echo ""
echo "📁 Backend:"
ls -la backend/ 2>/dev/null || echo "❌ Carpeta backend no encontrada"
echo ""
echo "📁 Frontend:"
ls -la frontend/ 2>/dev/null || echo "❌ Carpeta frontend no encontrada"

# Parar contenedores
log_info "Parando contenedores existentes..."
docker-compose down --volumes --remove-orphans 2>/dev/null || true

# Limpiar imágenes problemáticas
log_info "Limpiando imágenes con errores..."
docker images | grep -E "(sistema-avicola|avicola-app)" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
docker system prune -f

# Verificar Dockerfiles
log_info "Verificando Dockerfiles..."
if [ -f "backend/Dockerfile" ]; then
    echo "✅ backend/Dockerfile existe"
    if grep -q "nginx.conf" backend/Dockerfile; then
        log_error "❌ backend/Dockerfile contiene referencia incorrecta a nginx.conf"
        echo "🔧 Esto se debe corregir manualmente"
    else
        echo "✅ backend/Dockerfile está correcto"
    fi
else
    log_error "❌ backend/Dockerfile no existe"
fi

if [ -f "frontend/Dockerfile" ]; then
    echo "✅ frontend/Dockerfile existe"
else
    log_error "❌ frontend/Dockerfile no existe"
fi

if [ -f "frontend/nginx.conf" ]; then
    echo "✅ frontend/nginx.conf existe"
else
    log_error "❌ frontend/nginx.conf no existe"
fi

# Intentar build individual
log_info "Probando build del backend..."
if docker build -t test-backend ./backend; then
    log_success "Backend build exitoso"
    docker rmi test-backend
else
    log_error "Backend build falló"
fi

log_info "Probando build del frontend..."
if docker build -t test-frontend ./frontend; then
    log_success "Frontend build exitoso"
    docker rmi test-frontend
else
    log_error "Frontend build falló"
fi

echo ""
echo "🎯 Próximos pasos:"
echo "1. Corregir los Dockerfiles si hay errores"
echo "2. Ejecutar: docker-compose build --no-cache"
echo "3. Ejecutar: docker-compose up -d"
