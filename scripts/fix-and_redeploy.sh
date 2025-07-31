#!/bin/bash

echo "🔧 Solucionando problema del frontend que se cae..."

# Parar contenedores actuales
echo "🛑 Parando contenedores..."
docker-compose down

# Limpiar imágenes anteriores
echo "🧹 Limpiando imágenes anteriores..."
docker rmi $(docker images | grep sistema-avicola-frontend | awk '{print $3}') 2>/dev/null || true

# Reconstruir sin cache
echo "🔨 Reconstruyendo frontend sin cache..."
docker-compose build --no-cache frontend

# Iniciar servicios
echo "🚀 Iniciando servicios..."
docker-compose up -d

# Esperar y verificar
echo "⏳ Esperando 60 segundos para que se estabilice..."
sleep 60

# Verificar estado
echo "🔍 Verificando estado..."
docker-compose ps

# Probar conectividad múltiples veces
echo "🌐 Probando conectividad (5 intentos)..."
for i in {1..5}; do
    echo "Intento $i:"
    curl -f http://localhost:1705/health && echo "✅ Frontend OK" || echo "❌ Frontend falla"
    curl -f http://localhost:5000/health && echo "✅ Backend OK" || echo "❌ Backend falla"
    sleep 5
done

echo "📋 Ver logs si hay problemas:"
echo "   docker-compose logs frontend"
echo "   docker-compose logs backend"
