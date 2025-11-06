# Copilot Instructions - Sistema de Gestión de Repartos

## Proyecto Overview
Este es un sistema de gestión de repartos desarrollado con React Router v7 (anteriormente Remix) y TypeScript. El proyecto maneja clientes, camiones, repartos y rutas con autenticación JWT y base de datos PostgreSQL en Neon Cloud.

## Arquitectura del Sistema

### Stack Tecnológico
- **Frontend**: React Router v7, TypeScript, Tailwind CSS v4
- **Backend**: Node.js integrado con React Router
- **Base de Datos**: PostgreSQL (Neon Cloud)
- **Autenticación**: JWT + bcrypt + cookies HttpOnly
- **Validación**: TypeScript + validaciones nativas

### Estructura de Carpetas
```
app/
├── routes/                 # File-based routing
├── lib/                   # Server-side utilities  
├── types/                 # TypeScript definitions
├── components/            # React components (future)
└── root.tsx              # Root layout
```

## Base de Datos (PostgreSQL)

### Tablas Principales
- `usuarios` - Sistema de autenticación (4+ registros)
- `clientes` - Clientes con geolocalización (16 registros)
- `camiones` - Flota vehicular (3 registros)
- `rutas` - Recorridos por día (Lunes, Martes, etc.)
- `repartos` - Entregas asignadas
- `reparto_cliente` - Tabla intermedia many-to-many

### Conexión
- Configurada en `app/lib/database.server.ts`
- Connection pooling implementado
- Queries tipadas con TypeScript
- SSL requerido para Neon Cloud

## Sistema de Autenticación

### Implementación
- JWT tokens con expiración de 24h
- Contraseñas hasheadas con bcrypt (salt rounds: 12)
- Cookies HttpOnly para almacenar tokens
- Middleware de autenticación en `app/lib/auth.server.ts`

### Flujo de Auth
1. Login en `/login` con validación
2. Token JWT generado y almacenado en cookie
3. Middleware verifica token en rutas protegidas
4. Logout limpia cookie y redirige

## Rutas Implementadas

### ✅ Completadas
- `/` - Redirección automática según estado de auth
- `/login` - Página de autenticación
- `/logout` - Action para cerrar sesión
- `/dashboard` - Panel principal con estadísticas

### 🚧 Pendientes (Próxima implementación)
- `/clientes` - Lista de clientes
- `/clientes/nuevo` - Formulario de nuevo cliente
- `/clientes/:id` - Detalle/edición de cliente
- `/camiones` - Gestión de camiones
- `/repartos` - Sistema de repartos
- `/rutas` - Gestión de rutas

## Guías de Desarrollo

### Crear nueva ruta
```typescript
// app/routes/nueva-ruta.tsx
import type { LoaderFunctionArgs } from "react-router";
import { redirectIfNotAuthenticated } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = redirectIfNotAuthenticated(request);
  // Lógica de carga de datos
  return { user };
}

export default function NuevaRuta() {
  // Componente React
}
```

### Queries a base de datos
```typescript
// Usar funciones tipadas de database.server.ts
import { getAllClientes, createCliente } from "~/lib/database.server";

const clientes = await getAllClientes();
const nuevoCliente = await createCliente(clienteData);
```

### Formularios
```typescript
// Usar Form de React Router para mejor UX
import { Form, useActionData } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  // Procesar datos
}
```

## Estados del Proyecto

### ✅ Funcionalidades Operativas
- Servidor de desarrollo ejecutándose en puerto 5174
- Autenticación JWT completa
- Conexión a base de datos Neon verificada
- Dashboard con estadísticas reales
- TypeScript completamente configurado
- Layout responsivo con Tailwind CSS

### 📊 Datos Reales Conectados
- 16 clientes registrados
- 3 camiones en flota
- Sistema de rutas configurado
- Usuarios de prueba disponibles

## Convenciones de Código

### TypeScript
- Tipos estrictos para todas las interfaces
- Separación entre tipos de entidad y DTOs
- Funciones tipadas para queries a BD

### React Router v7
- File-based routing
- Server-side rendering (SSR)
- Formularios nativos con Form component
- Error boundaries automáticos

### Tailwind CSS
- Clases utilitarias para styling
- Responsive design mobile-first
- Colores consistentes para acciones

## Próximos Pasos Recomendados

1. **Implementar CRUD de Clientes** - Rutas y formularios
2. **Gestión de Camiones** - Crear, editar, asignar
3. **Sistema de Repartos** - Planificación y seguimiento
4. **Vista de Mapa** - Integrar geolocalización
5. **Optimizaciones** - Paginación, filtros, búsqueda

## Comandos Útiles

```bash
# Desarrollo
npm run dev              # Servidor desarrollo (puerto 5174)
npm run typecheck        # Verificar tipos
node analyze-db.js       # Analizar BD

# Producción  
npm run build            # Build optimizado
npm run start            # Servidor producción
```

## Migración desde Astro

Este proyecto fue migrado exitosamente desde Astro con las siguientes mejoras:
- React puro en lugar de componentes híbridos
- APIs integradas en lugar de endpoints separados
- TypeScript completo con tipos seguros
- Mejor manejo de formularios y estado
- Autenticación más robusta

El proyecto mantiene la misma funcionalidad pero con mejor developer experience y performance.