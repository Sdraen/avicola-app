#!/bin/bash

# Script de despliegue completo con corrección del envsubst
set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

echo -e "${BLUE}"
cat << "EOF"
🚀 ========================================
   SISTEMA AVÍCOLA IECI - DESPLIEGUE
   Versión con Script Envsubst Corregido
========================================
EOF
echo -e "${NC}"

# Verificar Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker no está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose no está instalado"
    exit 1
fi

# Limpieza completa
log_info "Limpieza completa de contenedores anteriores..."
docker-compose down --volumes --remove-orphans 2>/dev/null || true

# Eliminar imágenes específicas que pueden tener el problema
log_info "Eliminando imágenes problemáticas..."
docker images | grep -E "(sistema-avicola|avicola-app)" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
docker system prune -f

# Build paso a paso
log_info "Construyendo backend..."
if docker-compose build --no-cache backend; then
    log_success "Backend construido exitosamente"
else
    log_error "Error al construir backend"
    exit 1
fi

log_info "Construyendo frontend (con script envsubst corregido)..."
if docker-compose build --no-cache frontend; then
    log_success "Frontend construido exitosamente"
else
    log_error "Error al construir frontend"
    echo "📋 Logs de build del frontend:"
    docker-compose logs frontend
    exit 1
fi

# Iniciar servicios
log_info "Iniciando servicios..."
if docker-compose up -d; then
    log_success "Servicios iniciados"
else
    log_error "Error al iniciar servicios"
    exit 1
fi

# Esperar más tiempo para que el frontend se estabilice
log_info "Esperando 60 segundos para que los servicios se estabilicen..."
sleep 60

# Verificar estado de contenedores
log_info "Estado de contenedores:"
docker-compose ps

# Verificar logs para asegurar que no hay errores de envsubst
log_info "Verificando logs del frontend..."
echo "📋 Últimos logs del frontend:"
docker-compose logs --tail=10 frontend

# Verificar conectividad con reintentos
log_info "Verificando conectividad..."
max_attempts=15
attempt=1
backend_ok=false
frontend_ok=false

while [ $attempt -le $max_attempts ]; do
    echo -n "Intento $attempt/$max_attempts: "
    
    # Verificar backend
    if curl -s -f http://localhost:5000/health >/dev/null 2>&1; then
        backend_ok=true
        echo -n "Backend ✅ "
    else
        backend_ok=false
        echo -n "Backend ❌ "
    fi
    
    # Verificar frontend con múltiples endpoints
    if curl -s -f http://localhost:1705/health >/dev/null 2>&1 || curl -s -f http://localhost:1705 >/dev/null 2>&1; then
        frontend_ok=true
        echo -n "Frontend ✅"
    else
        frontend_ok=false
        echo -n "Frontend ❌"
    fi
    
    echo ""
    
    # Si ambos están OK, salir
    if [ "$backend_ok" = true ] && [ "$frontend_ok" = true ]; then
        log_success "¡Todos los servicios están funcionando!"
        break
    fi
    
    # Si el frontend falla después de varios intentos, mostrar logs
    if [ $attempt -gt 8 ] && [ "$frontend_ok" = false ]; then
        log_warning "Frontend sigue fallando, mostrando logs..."
        docker-compose logs --tail=5 frontend
    fi
    
    sleep 15
    ((attempt++))
done

# Resultado final
if [ "$backend_ok" = true ] && [ "$frontend_ok" = true ]; then
    echo ""
    log_success "🎉 ¡DESPLIEGUE EXITOSO!"
    echo ""
    echo "📱 URLs de Acceso:"
    echo "   🌐 Frontend:     http://localhost:1705"
    echo "   🔗 Backend API:  http://localhost:5000"
    echo "   💚 Health Check: http://localhost:5000/health"
    echo ""
    echo "🔍 Verificación final:"
    echo "   📊 Estado:    docker-compose ps"
    echo "   📋 Logs:      docker-compose logs -f"
    echo ""
    
    # Prueba final
    log_info "Realizando prueba final..."
    if curl -s http://localhost:5000/health | grep -q "ok"; then
        log_success "Backend API respondiendo correctamente"
    fi
    
    if curl -s -I http://localhost:1705 | grep -q "200 OK"; then
        log_success "Frontend respondiendo correctamente"
    fi
    
    echo ""
    echo "🎓 ¡Listo para evaluación!"
    
else
    log_error "Algunos servicios no están funcionando"
    echo ""
    echo "📋 Logs completos para diagnóstico:"
    docker-compose logs
    exit 1
fi
