// Tipos TypeScript para la base de datos

// Tabla: usuarios
export interface Usuario {
  id: number;
  username: string;
  email: string;
  password: string;
  nombre_completo: string;
  created_at: Date | null;
  updated_at: Date | null;
}

// DTO para crear usuario (sin campos autogenerados)
export interface CreateUsuario {
  username: string;
  email: string;
  password: string;
  nombre_completo: string;
}

// DTO para login
export interface LoginRequest {
  username: string;
  password: string;
}

// Tabla: clientes
export interface Cliente {
  id: number;
  codigoalte: string | null;
  razonsocial: string;
  nombre: string;
  direccion: string;
  telefono: string | null;
  rut: string | null;
  estado: string | null; // DEFAULT: 'Activo'
  longitud: number | null; // numeric(11,8)
  latitud: number | null;  // numeric(10,7)
}

// DTO para crear cliente
export interface CreateCliente {
  codigoalte?: string | null;
  razonsocial: string;
  nombre: string;
  direccion: string;
  telefono?: string | null;
  rut?: string | null;
  estado?: string | null;
  longitud?: number | null;
  latitud?: number | null;
}

// DTO para actualizar cliente
export interface UpdateCliente extends Partial<CreateCliente> {
  id: number;
}

// Cliente con datos calculados (para dashboard)
export interface ClienteWithStats extends Cliente {
  total_repartos?: number;
  ultimo_reparto?: Date | null;
}

// Tabla: camiones
export interface Camion {
  id: number;
  nombre: string;
}

// DTO para crear camión
export interface CreateCamion {
  nombre: string;
}

// DTO para actualizar camión
export interface UpdateCamion extends Partial<CreateCamion> {
  id: number;
}

// Camión con estadísticas
export interface CamionWithStats extends Camion {
  total_repartos?: number;
  repartos_activos?: number;
}

// Tabla: rutas
export interface Ruta {
  id: number;
  nombre: string;
}

// DTO para crear ruta
export interface CreateRuta {
  nombre: string;
}

// DTO para actualizar ruta
export interface UpdateRuta extends Partial<CreateRuta> {
  id: number;
}

// Ruta con estadísticas
export interface RutaWithStats extends Ruta {
  total_clientes: number;
  total_repartos: number;
  clientes_asignados: Cliente[];
  distancia_promedio?: number;
  zona_geografica?: string;
}

// Ruta optimizada
export interface RutaOptimizada extends RutaWithStats {
  clientes_optimizados: ClienteOptimizado[];
  distancia_total: number;
  tiempo_estimado: number;
}

// Cliente optimizado para rutas
export interface ClienteOptimizado extends Cliente {
  orden_visita: number;
  distancia_anterior: number;
  tiempo_estimado: number;
}

// Tabla: repartos
export interface Reparto {
  id: number;
  camion_id: number | null;
  ruta_id: number | null;
}

// DTO para crear reparto
export interface CreateReparto {
  camion_id?: number | null;
  ruta_id?: number | null;
}

// DTO para actualizar reparto
export interface UpdateReparto extends Partial<CreateReparto> {
  id: number;
}

// Reparto con relaciones completas
export interface RepartoWithDetails extends Reparto {
  camion?: Camion | null;
  ruta?: Ruta | null;
  clientes?: Cliente[];
}

// Tabla intermedia: reparto_cliente
export interface RepartoCliente {
  reparto_id: number;
  cliente_id: number;
}

// DTO para crear relación reparto-cliente
export interface CreateRepartoCliente {
  reparto_id: number;
  cliente_id: number;
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipos para paginación
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Tipos para filtros
export interface ClienteFilters {
  search?: string;
  estado?: string;
  codigoalte?: string;
  hasCoordinates?: boolean;
}

export interface RepartoFilters {
  camion_id?: number;
  ruta_id?: number;
  fecha_desde?: Date;
  fecha_hasta?: Date;
}

// Tipos para estadísticas del dashboard
export interface DashboardStats {
  totalClientes: number;
  totalCamiones: number;
  totalRepartos: number;
  totalRutas: number;
  clientesActivos: number;
  repartosHoy: number;
  camionesSinAsignar: number;
}

// Tipos para autenticación JWT
export interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  nombre_completo: string;
  iat?: number;
  exp?: number;
}

// Tipos para contexto de sesión
export interface SessionUser {
  id: number;
  username: string;
  email: string;
  nombre_completo: string;
}

// Tipos para formularios
export interface LoginFormData {
  username: string;
  password: string;
}

export interface ClienteFormData {
  codigoalte: string;
  razonsocial: string;
  nombre: string;
  direccion: string;
  telefono: string;
  rut: string;
  longitud: string; // Como string para formularios
  latitud: string;  // Como string para formularios
}

// Tipos de estado para UI
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface UIState {
  loading: LoadingState;
  error: string | null;
  success: string | null;
}

// Tipos para mapas
export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface ClienteMapData {
  id: number;
  nombre: string;
  direccion: string;
  coordinates: MapCoordinates;
  estado: string;
}

// Exportar tipos de base de datos como union
export type DatabaseEntity = Usuario | Cliente | Camion | Ruta | Reparto | RepartoCliente;
export type CreateDatabaseEntity = CreateUsuario | CreateCliente | CreateCamion | CreateRuta | CreateReparto | CreateRepartoCliente;
export type UpdateDatabaseEntity = UpdateCliente | UpdateCamion | UpdateRuta | UpdateReparto;