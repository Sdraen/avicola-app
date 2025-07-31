#!/bin/bash

# Script específico para solucionar el problema del envsubst
echo "🔧 Solucionando problema del script envsubst en frontend..."

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Parar contenedores
log_info "Parando contenedores..."
docker-compose down

# Eliminar imagen problemática del frontend
log_info "Eliminando imagen problemática del frontend..."
docker rmi $(docker images | grep sistema-avicola-frontend | awk '{print $3}') 2>/dev/null || true

# Reconstruir solo el frontend
log_info "Reconstruyendo frontend con script corregido..."
if docker-compose build --no-cache frontend; then
    log_success "Frontend reconstruido exitosamente"
else
    log_error "Error al reconstruir frontend"
    exit 1
fi

# Iniciar servicios
log_info "Iniciando servicios..."
docker-compose up -d

# Esperar y verificar
log_info "Esperando 45 segundos para que se estabilice..."
sleep 45

# Verificar logs del frontend
log_info "Verificando logs del frontend..."
echo "📋 Últimos logs del frontend:"
docker-compose logs --tail=20 frontend

# Probar conectividad
log_info "Probando conectividad..."
for i in {1..5}; do
    echo -n "Intento $i: "
    if curl -s -f http://localhost:1705/health >/dev/null 2>&1; then
        echo "✅ Frontend OK"
        frontend_ok=true
        break
    else
        echo "❌ Frontend falla"
        frontend_ok=false
    fi
    sleep 10
done

if [ "$frontend_ok" = true ]; then
    log_success "🎉 Frontend funcionando correctamente!"
    echo "🌐 Accede a: http://localhost:1705"
else
    log_error "Frontend sigue fallando"
    echo "📋 Logs completos:"
    docker-compose logs frontend
fi
