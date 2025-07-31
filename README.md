# 🐔 Sistema Avícola IECI - Despliegue con Docker

## 📋 Descripción
Sistema completo de gestión avícola desarrollado con React (Frontend) y Node.js/Express (Backend), desplegado con Docker para máxima portabilidad y facilidad de instalación.

## 🚀 Despliegue Rápido

### Para Desarrollo Local (localhost)
\`\`\`bash
git clone [tu-repositorio]
cd sistema-avicola
git checkout production-docker-config
chmod +x scripts/*.sh
./scripts/deploy.sh
\`\`\`

**Acceso:**
- 🌐 Frontend: http://localhost:1705
- 🔗 Backend: http://localhost:5000/health

---

## 🌐 Despliegue en Servidor con IP Específica

### Opción 1: IP Automática (Recomendada)
El sistema detecta automáticamente la IP del servidor:

\`\`\`bash
# 1. Clonar repositorio
git clone [tu-repositorio]
cd sistema-avicola
git checkout production-docker-config

# 2. Configurar IP automáticamente
IP=$(hostname -I | awk '{print $1}')
echo "🌐 IP detectada: $IP"
sed -i "s/localhost/$IP/g" docker-compose.yml

# 3. Desplegar
chmod +x scripts/*.sh
./scripts/deploy.sh
\`\`\`

### Opción 2: IP Manual
Si conoces la IP específica del servidor:

\`\`\`bash
# 1. Clonar repositorio
git clone [tu-repositorio]
cd sistema-avicola
git checkout production-docker-config

# 2. Configurar IP específica (reemplazar 192.168.1.100 por tu IP)
export SERVER_IP=192.168.1.100
sed -i "s/localhost/$SERVER_IP/g" docker-compose.yml

# 3. Desplegar
chmod +x scripts/*.sh
./scripts/deploy.sh
\`\`\`

### Opción 3: Un Solo Comando
\`\`\`bash
git clone [tu-repositorio] && cd sistema-avicola && git checkout production-docker-config && IP=$(hostname -I | awk '{print $1}') && sed -i "s/localhost/$IP/g" docker-compose.yml && chmod +x scripts/*.sh && ./scripts/deploy.sh
\`\`\`

---

## 🎯 Acceso Según Configuración

### Desarrollo Local:
- 🌐 **Frontend**: http://localhost:1705
- 🔗 **Backend**: http://localhost:5000
- 💚 **Health Check**: http://localhost:5000/health

### Servidor con IP:
- 🌐 **Frontend**: http://[IP_DEL_SERVIDOR]:1705
- 🔗 **Backend**: http://[IP_DEL_SERVIDOR]:5000
- 💚 **Health Check**: http://[IP_DEL_SERVIDOR]:5000/health

**Ejemplo con IP 192.168.1.100:**
- 🌐 Frontend: http://192.168.1.100:1705
- 🔗 Backend: http://192.168.1.100:5000/health

---

## 🔧 Configuración Manual Avanzada

### Para Cambiar IP Después del Despliegue:

1. **Parar servicios:**
\`\`\`bash
docker-compose down
\`\`\`

2. **Cambiar IP en configuración:**
\`\`\`bash
# Cambiar de localhost a IP específica
sed -i 's/localhost/192.168.1.100/g' docker-compose.yml

# O cambiar de una IP a otra
sed -i 's/192.168.1.100/10.0.0.50/g' docker-compose.yml
\`\`\`

3. **Reconstruir y reiniciar:**
\`\`\`bash
docker-compose build --no-cache
docker-compose up -d
\`\`\`

### Para Múltiples IPs (Acceso desde Varias Redes):

Editar manualmente `docker-compose.yml` y cambiar:
\`\`\`yaml
- ALLOWED_ORIGINS=http://localhost:1705,http://127.0.0.1:1705
\`\`\`

Por:
\`\`\`yaml
- ALLOWED_ORIGINS=http://localhost:1705,http://192.168.1.100:1705,http://10.0.0.50:1705
\`\`\`

---

## 🛠️ Comandos Útiles

### Verificación y Monitoreo:
\`\`\`bash
# Ver estado de contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs específicos
docker-compose logs frontend
docker-compose logs backend

# Verificar conectividad
curl http://[IP]:1705
curl http://[IP]:5000/health
\`\`\`

### Mantenimiento:
\`\`\`bash
# Reiniciar servicios
docker-compose restart

# Parar servicios
docker-compose down

# Limpiar y empezar de cero
docker-compose down --volumes --remove-orphans
docker system prune -f
./scripts/deploy.sh
\`\`\`

### Debugging:
\`\`\`bash
# Acceder al contenedor del backend
docker exec -it sistema-avicola-backend sh

# Acceder al contenedor del frontend
docker exec -it sistema-avicola-frontend sh

# Ver uso de recursos
docker stats
\`\`\`

---

## 🔍 Solución de Problemas

### Problema: "Connection Refused"
\`\`\`bash
# Verificar que los contenedores estén corriendo
docker-compose ps

# Reiniciar servicios
docker-compose restart

# Ver logs para identificar errores
docker-compose logs -f
\`\`\`

### Problema: Frontend no carga
\`\`\`bash
# Verificar logs del frontend
docker-compose logs frontend

# Reconstruir frontend
docker-compose build --no-cache frontend
docker-compose up -d
\`\`\`

### Problema: Backend no responde
\`\`\`bash
# Verificar logs del backend
docker-compose logs backend

# Probar health check
curl http://[IP]:5000/health

# Reiniciar solo el backend
docker-compose restart backend
\`\`\`

### Problema: Puertos ocupados
\`\`\`bash
# Ver qué está usando los puertos
sudo lsof -i :1705
sudo lsof -i :5000

# Cambiar puertos en docker-compose.yml si es necesario
# Ejemplo: cambiar "1705:80" por "8080:80"
\`\`\`

---

## 📦 Requisitos del Sistema

### Mínimos:
- **OS**: Linux, macOS, Windows con WSL2
- **RAM**: 2GB disponibles
- **Disco**: 5GB libres
- **Docker**: 20.10+
- **Docker Compose**: 2.0+

### Recomendados:
- **RAM**: 4GB disponibles
- **CPU**: 2 cores
- **Disco**: 10GB libres

---

## 🏗️ Arquitectura

\`\`\`
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   (React)       │    │   (Node.js)     │
│   Port: 1705    │◄──►│   Port: 5000    │
│   Nginx         │    │   Express       │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
                   │
         ┌─────────────────┐
         │   Supabase      │
         │   (Database)    │
         └─────────────────┘
\`\`\`

---

## 🔒 Seguridad

- ✅ Contenedores ejecutan con usuario no-root
- ✅ Headers de seguridad configurados en Nginx
- ✅ Rate limiting en el backend
- ✅ CORS configurado apropiadamente
- ✅ Variables de entorno para credenciales
- ✅ Health checks automáticos

---

## 🎓 Para Evaluadores/Profesores

### Despliegue en Un Comando:
\`\`\`bash
curl -sSL https://raw.githubusercontent.com/[tu-usuario]/[tu-repo]/production-docker-config/scripts/quick-deploy.sh | bash
\`\`\`

### O Paso a Paso:
\`\`\`bash
git clone [tu-repositorio]
cd sistema-avicola
git checkout production-docker-config
IP=$(hostname -I | awk '{print $1}')
sed -i "s/localhost/$IP/g" docker-compose.yml
chmod +x scripts/*.sh
./scripts/deploy.sh
\`\`\`

### Verificación:
- ✅ Acceder a http://[IP_DEL_SERVIDOR]:1705
- ✅ Verificar API en http://[IP_DEL_SERVIDOR]:5000/health
- ✅ Revisar logs con `docker-compose logs -f`

---

## 📞 Soporte

### Logs Importantes:
\`\`\`bash
# Logs completos
docker-compose logs > logs_completos.txt

# Solo errores
docker-compose logs | grep -i error

# Estado del sistema
docker-compose ps > estado_contenedores.txt
docker stats --no-stream > uso_recursos.txt
\`\`\`

### Información del Sistema:
\`\`\`bash
# Versiones
docker --version
docker-compose --version

# Espacio disponible
df -h

# Memoria disponible
free -h
\`\`\`

---

## 🚀 Ejemplos de Uso

### Desarrollo Local:
\`\`\`bash
git clone https://github.com/usuario/sistema-avicola.git
cd sistema-avicola
git checkout production-docker-config
./scripts/deploy.sh
# Acceder a: http://localhost:1705
\`\`\`

### Servidor de Producción:
\`\`\`bash
git clone https://github.com/usuario/sistema-avicola.git
cd sistema-avicola
git checkout production-docker-config
IP=$(curl -s ifconfig.me)  # IP pública
sed -i "s/localhost/$IP/g" docker-compose.yml
./scripts/deploy.sh
# Acceder a: http://[IP_PUBLICA]:1705
\`\`\`

### Red Local (LAN):
\`\`\`bash
git clone https://github.com/usuario/sistema-avicola.git
cd sistema-avicola
git checkout production-docker-config
IP=$(hostname -I | awk '{print $1}')  # IP local
sed -i "s/localhost/$IP/g" docker-compose.yml
./scripts/deploy.sh
# Acceder desde cualquier dispositivo en la red: http://[IP_LOCAL]:1705
\`\`\`

---

## 📝 Notas Importantes

- 🔥 **Firewall**: Asegúrate de que los puertos 1705 y 5000 estén abiertos
- 🌐 **DNS**: Para acceso por dominio, configura un reverse proxy (Nginx/Apache)
- 🔐 **SSL**: Para HTTPS, usa Let's Encrypt o certificados propios
- 📊 **Monitoreo**: Los health checks están configurados automáticamente
- 🔄 **Actualizaciones**: Usa `git pull` y `docker-compose build --no-cache`

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.
