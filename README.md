# 🐔 Sistema de Gestión Avícola IECI

**Plataforma full-stack de digitalización de procesos administrativos, logísticos y contables para MiPymes avícolas.**

> Proyecto de Título | Ingeniería en Ejecución en Computación e Informática | UBB 2025

---

## 📊 Impacto

- **Reducción de tiempo operativo**: 40–60% en registro manual diario
- **Centralización de datos**: Eliminación de duplicidad y cuadernos físicos
- **Trazabilidad completa**: Auditoría por usuario/fecha en todas las operaciones
- **Automatización**: Cálculos y formatos antes manuales, ahora sistematizados

---

## 🎯 Descripción del Proyecto

Sistema modular diseñado e implementado desde cero para digitalizar flujos de negocio en una granja avícola real. Incluye módulos para:

- **Inventario**: Registro centralizado de recursos y materiales
- **Ventas**: Gestión de pedidos y facturación
- **Sanitario**: Seguimiento de tratamientos y registros de salud animal
- **Reportería**: Dashboards con datos consolidados

### Arquitectura

```
┌─────────────────────────────────────────────────────┐
│          React SPA (TypeScript)                     │
│  ├─ Componentización modular                        │
│  ├─ State management escalable                      │
│  └─ Autenticación integrada                         │
├─────────────────────────────────────────────────────┤
│       Node.js/Express REST API (TypeScript)         │
│  ├─ Auth/Roles (Supabase)                           │
│  ├─ Validación robusta de datos                     │
│  └─ Error handling centralizado                     │
├─────────────────────────────────────────────────────┤
│         PostgreSQL + Supabase (BaaS)                │
│  ├─ Modelado relacional con ERD                     │
│  ├─ Row-level security (RLS)                        │
│  └─ Backups automáticos                             │
└─────────────────────────────────────────────────────┘
```

### Diseño y Análisis

- **Levantamiento de requerimientos**: Entrevistas con usuarios finales (no técnicos)
- **Modelado de procesos**: BPMN 2.0 para visualizar flujos actuales
- **Diseño de datos**: ERD completo con análisis de dependencias
- **Documento de especificación**: 50+ páginas detallando requisitos funcionales y no funcionales

---

## 🛠️ Tech Stack

| Capa | Tecnología | Versión/Detalles |
|------|-----------|-------------------|
| **Frontend** | React, TypeScript, Vite | SPA con componentes funcionales |
| **Backend** | Node.js, Express, TypeScript | API REST con autenticación |
| **Base de Datos** | PostgreSQL, Supabase | Modelado relacional + RLS |
| **Deployment** | Docker, Docker Compose, Linux (Debian) | Imagen multi-stage, nginx |
| **DevOps** | PM2, Nginx, Systemd | Reverse proxy, process manager |
| **Herramientas** | Git, GitHub, Postman | Versionado y testing de APIs |

---

## ✨ Características Principales

### 1. Autenticación y Control de Acceso
- Sistema de roles (admin, gerente, operario)
- Persistencia de sesión
- Logout seguro

### 2. Módulo de Inventario
- Registro centralizado de recursos
- Historial de movimientos
- Consultas por categoría/período

### 3. Módulo de Ventas
- Creación de pedidos con validación
- Cálculo automático de totales
- Generación de reportes

### 4. Módulo Sanitario
- Registro de tratamientos
- Seguimiento de mortalidad
- Alertas por anomalías

### 5. Reportería
- Dashboards con gráficos en tiempo real
- Exportación a PDF
- Filtros dinámicos

---

## 🚀 Quick Start

### Requisitos
- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM mínimo
- 5GB disco

### Desarrollo Local (1 comando)

```bash
git clone https://github.com/Sdraen/avicola-app.git
cd avicola-app
git checkout production-docker-config
./scripts/deploy.sh
```

**Acceso:**
- 🌐 Frontend: http://localhost:1705
- 🔗 Backend: http://localhost:5000
- 💚 Health: http://localhost:5000/health

### En Servidor (con IP automática)

```bash
git clone https://github.com/Sdraen/avicola-app.git
cd avicola-app
git checkout production-docker-config

# Auto-detect IP and configure
IP=$(hostname -I | awk '{print $1}')
sed -i "s/localhost/$IP/g" docker-compose.yml

./scripts/deploy.sh
```

---

## 📁 Estructura del Proyecto

```
avicola-app/
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/            # Vistas por módulo
│   │   ├── context/          # Context API para state
│   │   ├── hooks/            # Custom hooks
│   │   └── types/            # TypeScript interfaces
│   └── vite.config.ts
├── backend/                  # Node.js/Express API
│   ├── src/
│   │   ├── routes/           # Endpoints organizados por recurso
│   │   ├── controllers/      # Lógica de negocio
│   │   ├── middleware/       # Auth, validación, error handling
│   │   ├── models/           # Queries a BD
│   │   ├── types/            # TypeScript types
│   │   └── config/           # Configuración de BD
│   └── server.ts
├── supabase/                 # Configuración de Supabase
│   └── migrations/           # Schemas y políticas RLS
├── scripts/                  # Deploy automation
│   ├── deploy.sh             # Script principal
│   └── health-check.sh       # Validaciones
├── docker-compose.yml        # Orquestación
└── README.md
```

---

## 🔐 Seguridad

- **Autenticación**: JWT con Supabase Auth
- **Autorización**: Row-level security en PostgreSQL
- **Validación**: Schemas en backend y frontend
- **CORS**: Configurado restrictivamente
- **Variables sensibles**: Gestionadas con `.env`

---

## 📊 Comandos Útiles

### Ver estado
```bash
docker-compose ps
docker-compose logs -f
```

### Debugging
```bash
# Acceder al contenedor backend
docker exec -it sistema-avicola-backend sh

# Ver uso de recursos
docker stats
```

### Mantenimiento
```bash
# Reiniciar servicios
docker-compose restart

# Parar y limpiar
docker-compose down --volumes
```

---

## 🎓 Lecciones Aprendidas

Durante el desarrollo de este proyecto adquirí experiencia en:

- **Full-Stack Development**: Desde BD hasta UI
- **TypeScript**: Type safety en todo el stack
- **Análisis de Requerimientos**: Comunicación con usuarios no técnicos
- **Diseño de Bases de Datos**: ERD, normalización, índices
- **Despliegue**: Docker, configuración de servidores, reverse proxy
- **Git Workflow**: Ramas por feature, PRs, code reviews
- **Testing**: Validación manual exhaustiva

---

## 🚀 Próximas Mejoras

- [ ] Tests automatizados (Jest, Vitest)
- [ ] CI/CD con GitHub Actions
- [ ] Módulo de reportería avanzada
- [ ] Mobile app con React Native
- [ ] Autoscaling con Kubernetes

---

## 📞 Contacto & Soporte

Preguntas sobre la arquitectura, implementación o despliegue:

- 📧 **Email**: andrestorres.cl
- 🔗 **LinkedIn**: www.linkedin.com/in/andrestorresdev
- 💻 **Web**: www.andrestorres.cl

---

## 📜 Licencia

Proyecto de Título bajo Licencia MIT.

---

**Última actualización**: Sep 2025  
**Estado**: Completo y funcional en producción
