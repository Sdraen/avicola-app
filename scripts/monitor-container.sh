#!/bin/bash

echo "📊 Monitoreando contenedores cada 30 segundos..."
echo "Presiona Ctrl+C para salir"

while true; do
    clear
    echo "=== $(date) ==="
    echo ""
    
    # Estado de contenedores
    echo "🐳 Estado de contenedores:"
    docker-compose ps
    echo ""
    
    # Uso de recursos
    echo "📊 Uso de recursos:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
    echo ""
    
    # Probar conectividad
    echo "🌐 Conectividad:"
    curl -s -f http://localhost:1705/health >/dev/null && echo "✅ Frontend: OK" || echo "❌ Frontend: FALLA"
    curl -s -f http://localhost:5000/health >/dev/null && echo "✅ Backend: OK" || echo "❌ Backend: FALLA"
    echo ""
    
    # Últimos logs de error
    echo "📋 Últimos errores del frontend:"
    docker-compose logs --tail=3 frontend 2>/dev/null | grep -i error || echo "Sin errores recientes"
    
    sleep 30
done
