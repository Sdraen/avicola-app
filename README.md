# Avícola APP - Dockerizado

Este proyecto contiene el entorno completo para desplegar el sistema Avícola APP usando Docker.

## 📁 Estructura del proyecto

```
avicola-docker/
├── backend/
│   ├── Dockerfile
│   └── .env              # Debes colocarlo tú (usa el .env del servidor)
├── frontend/
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

---

## ⚙️ Requisitos

- Tener [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado (Windows o Mac).
- Git instalado (opcional, si vas a clonar desde repositorio).

---

## 🪟 Cómo usar en Windows

### 1. Clonar el proyecto o copiar la carpeta

Puedes clonar desde Git si tienes repo:

```bash
git clone https://github.com/usuario/avicola-docker.git
cd avicola-docker
```

O simplemente copiar los archivos `.zip` y descomprimirlos.

---

### 2. Agrega tu archivo `.env` en la carpeta `/backend`

Crea un archivo `.env` en `backend/` con el siguiente contenido (ejemplo):

```
NODE_ENV=production
PORT=5000

SUPABASE_URL=https://raedaqgefjftnmpaqfcr.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
JWT_SECRET=sistema_avicola_ubb_produccion_2025_super_secreto_no_compartir_torres_especialidades
ALLOWED_ORIGINS=http://146.83.198.35:1705,https://146.83.198.35:1706
```

---

### 3. Construir los contenedores

Abre una terminal en la raíz del proyecto y ejecuta:

```bash
docker-compose build
```

---

### 4. Iniciar los servicios

```bash
docker-compose up -d
```

Esto levantará:

- Backend en: `http://localhost:5000`
- Frontend en: `http://localhost:80`

---

## 🌐 ¿Y si estoy en la red de la Universidad?

Perfecto. La configuración usa las IPs reales del servidor de la U, así que funcionará directamente.

Puedes acceder desde el navegador de la VM a:

```
http://146.83.198.35:1705
```

---

## 🛑 Para detener los servicios

```bash
docker-compose down
```

---

## 🧪 Verificación rápida

- Visita `http://localhost:80` desde tu navegador
- Tu frontend React debe estar activo
- El frontend se conectará automáticamente al backend remoto (según tu .env)

---

## ✉️ Soporte

Si estás en una VM de la universidad y algo falla, asegúrate de:
- Estar conectado al WiFi de la U
- Que Docker esté corriendo
- Que el puerto 80 y 5000 estén libres

¡Suerte presentando tu proyecto! 🎓🐔