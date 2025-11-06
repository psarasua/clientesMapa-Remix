# 🚀 Sistema de Gestión de Repartos - React Router v7

Sistema completo de gestión de clientes, camiones y repartos desarrollado con **React Router v7** y **TypeScript**. Migrado desde Astro para una mejor experiencia de desarrollo con React.

## ✨ Características

- 🔐 **Autenticación completa** con JWT y cookies seguras
- 👥 **Gestión de Clientes** - CRUD completo con validaciones
- 🚛 **Gestión de Camiones** - Control de flota vehicular
- 📦 **Sistema de Repartos** - Planificación y seguimiento
- 🗺️ **Rutas optimizadas** - Gestión de recorridos
- 📊 **Dashboard interactivo** - Estadísticas en tiempo real
- 🎨 **Interfaz responsive** - Diseño optimizado para móviles
- 🔒 **Base de datos segura** - PostgreSQL en Neon Cloud
- ⚡ **Performance** - SSR con React Router v7

## 🛠️ Tecnologías

- **Frontend**: React Router v7, TypeScript, Tailwind CSS
- **Backend**: Node.js integrado con React Router
- **Base de Datos**: PostgreSQL (Neon Cloud)
- **Autenticación**: JWT + bcrypt
- **Validación**: Validaciones nativas + TypeScript
- **Styling**: Tailwind CSS v4

## �️ Estructura de Base de Datos

### Tablas implementadas:
- **usuarios** - Sistema de autenticación (4+ usuarios)
- **clientes** - Gestión de clientes (16 registros actuales)
- **camiones** - Flota vehicular (3 camiones)
- **rutas** - Recorridos (Lunes, Martes, etc.)
- **repartos** - Entregas asignadas
- **reparto_cliente** - Relación many-to-many

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- PostgreSQL (Neon Cloud configurado)

### 1. Configurar variables de entorno
```bash
# Copiar las variables del proyecto Astro existente
cp ../Astro/.env .env
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Verificar conexión a base de datos
```bash
node analyze-db.js
```

### 4. Desarrollo
```bash
npm run dev
```

Your application will be available at `http://localhost:5174/`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
