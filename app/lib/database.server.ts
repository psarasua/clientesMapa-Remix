import { Pool } from 'pg';
import type { PoolClient } from 'pg';
import type { 
  Cliente, 
  CreateCliente, 
  UpdateCliente,
  Camion,
  CamionWithStats,
  CreateCamion, 
  UpdateCamion,
  Ruta, 
  CreateRuta, 
  UpdateRuta,
  Reparto, 
  CreateReparto, 
  UpdateReparto,
  RepartoWithDetails,
  RepartoCliente,
  CreateRepartoCliente,
  Usuario,
  CreateUsuario,
  DashboardStats,
  PaginatedResponse,
  ClienteFilters,
  RepartoFilters
} from '~/types/database';

// Pool de conexiones a PostgreSQL
let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL no está configurada en las variables de entorno');
    }
    
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    
    pool.on('error', (err: Error) => {
      console.error('Error inesperado en el cliente de base de datos:', err);
    });
  }
  
  return pool;
}

// Función helper para ejecutar queries
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const dbPool = getDbPool();
  let client: PoolClient | null = null;
  
  try {
    client = await dbPool.connect();
    const result = await client.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Error en query de base de datos:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Función para cerrar todas las conexiones
export async function closeDbConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// =====================================
// CRUD para CLIENTES
// =====================================

export async function getAllClientes(filters?: ClienteFilters): Promise<Cliente[]> {
  let whereClause = 'WHERE 1=1';
  const params: any[] = [];
  let paramCount = 0;

  if (filters?.search) {
    paramCount++;
    whereClause += ` AND (nombre ILIKE $${paramCount} OR razonsocial ILIKE $${paramCount} OR direccion ILIKE $${paramCount})`;
    params.push(`%${filters.search}%`);
  }

  if (filters?.estado) {
    paramCount++;
    whereClause += ` AND estado = $${paramCount}`;
    params.push(filters.estado);
  }

  if (filters?.hasCoordinates !== undefined) {
    whereClause += filters.hasCoordinates 
      ? ' AND longitud IS NOT NULL AND latitud IS NOT NULL'
      : ' AND (longitud IS NULL OR latitud IS NULL)';
  }

  const queryText = `
    SELECT * FROM clientes 
    ${whereClause}
    ORDER BY nombre ASC
  `;

  return await query<Cliente>(queryText, params);
}

export async function getClienteById(id: number): Promise<Cliente | null> {
  const result = await query<Cliente>('SELECT * FROM clientes WHERE id = $1', [id]);
  return result[0] || null;
}

export async function createCliente(clienteData: CreateCliente): Promise<Cliente> {
  const {
    codigoalte,
    razonsocial,
    nombre,
    direccion,
    telefono,
    rut,
    estado = 'Activo',
    longitud,
    latitud
  } = clienteData;

  const result = await query<Cliente>(
    `INSERT INTO clientes (codigoalte, razonsocial, nombre, direccion, telefono, rut, estado, longitud, latitud)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [codigoalte, razonsocial, nombre, direccion, telefono, rut, estado, longitud, latitud]
  );

  return result[0];
}

export async function updateCliente(id: number, clienteData: Partial<CreateCliente>): Promise<Cliente | null> {
  const fields = Object.keys(clienteData).filter(key => clienteData[key as keyof CreateCliente] !== undefined);
  
  if (fields.length === 0) {
    return await getClienteById(id);
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
  const values = [id, ...fields.map(field => clienteData[field as keyof CreateCliente])];

  const result = await query<Cliente>(
    `UPDATE clientes SET ${setClause} WHERE id = $1 RETURNING *`,
    values
  );

  return result[0] || null;
}

export async function deleteCliente(id: number): Promise<boolean> {
  const result = await query('DELETE FROM clientes WHERE id = $1', [id]);
  return result.length > 0;
}

// =====================================
// CRUD para CAMIONES
// =====================================

export async function getAllCamiones(): Promise<Camion[]> {
  return await query<Camion>('SELECT * FROM camiones ORDER BY nombre ASC');
}

export async function getCamionById(id: number): Promise<Camion | null> {
  const result = await query<Camion>('SELECT * FROM camiones WHERE id = $1', [id]);
  return result[0] || null;
}

export async function getCamionesWithStats(): Promise<CamionWithStats[]> {
  const camiones = await getAllCamiones();
  
  const repartosQuery = await query<{camion_id: number, total: string}>(
    'SELECT camion_id, COUNT(*) as total FROM repartos WHERE camion_id IS NOT NULL GROUP BY camion_id'
  );
  
  const repartosMap = new Map<number, number>();
  repartosQuery.forEach(row => {
    repartosMap.set(row.camion_id, parseInt(row.total));
  });
  
  return camiones.map(camion => ({
    ...camion,
    total_repartos: repartosMap.get(camion.id) || 0,
    repartos_activos: Math.floor(Math.random() * 2), // Simulado
  }));
}

export async function createCamion(camionData: CreateCamion): Promise<Camion> {
  const result = await query<Camion>(
    'INSERT INTO camiones (nombre) VALUES ($1) RETURNING *',
    [camionData.nombre]
  );
  return result[0];
}

export async function updateCamion(id: number, camionData: Partial<CreateCamion>): Promise<Camion | null> {
  if (!camionData.nombre) {
    return await getCamionById(id);
  }

  const result = await query<Camion>(
    'UPDATE camiones SET nombre = $2 WHERE id = $1 RETURNING *',
    [id, camionData.nombre]
  );

  return result[0] || null;
}

export async function deleteCamion(id: number): Promise<boolean> {
  const repartosActivos = await query(
    'SELECT COUNT(*) as count FROM repartos WHERE camion_id = $1',
    [id]
  );
  
  if (parseInt(repartosActivos[0].count) > 0) {
    throw new Error('No se puede eliminar un camión con repartos asignados');
  }
  
  const result = await query('DELETE FROM camiones WHERE id = $1', [id]);
  return result.length > 0;
}

// =====================================
// CRUD para RUTAS
// =====================================

export async function getAllRutas(): Promise<Ruta[]> {
  return await query<Ruta>('SELECT * FROM rutas ORDER BY nombre ASC');
}

export async function getRutaById(id: number): Promise<Ruta | null> {
  const result = await query<Ruta>('SELECT * FROM rutas WHERE id = $1', [id]);
  return result[0] || null;
}

export async function createRuta(rutaData: CreateRuta): Promise<Ruta> {
  const result = await query<Ruta>(
    'INSERT INTO rutas (nombre) VALUES ($1) RETURNING *',
    [rutaData.nombre]
  );
  return result[0];
}

export async function updateRuta(id: number, rutaData: Partial<CreateRuta>): Promise<Ruta | null> {
  if (!rutaData.nombre) {
    return await getRutaById(id);
  }

  const result = await query<Ruta>(
    'UPDATE rutas SET nombre = $2 WHERE id = $1 RETURNING *',
    [id, rutaData.nombre]
  );

  return result[0] || null;
}

export async function deleteRuta(id: number): Promise<boolean> {
  const result = await query('DELETE FROM rutas WHERE id = $1', [id]);
  return result.length > 0;
}

// =====================================
// RUTAS OPTIMIZADAS
// =====================================

export interface RutaWithStats extends Ruta {
  total_clientes: number;
  total_repartos: number;
  clientes_asignados: Cliente[];
  distancia_promedio?: number;
  zona_geografica?: string;
}

export interface RutaOptimizada extends RutaWithStats {
  clientes_optimizados: ClienteOptimizado[];
  distancia_total: number;
  tiempo_estimado: number;
}

export interface ClienteOptimizado extends Cliente {
  orden_visita: number;
  distancia_anterior: number;
  tiempo_estimado: number;
}

// Obtener rutas con estadísticas completas
export async function getRutasWithStats(): Promise<RutaWithStats[]> {
  const result = await query<any>(`
    SELECT 
      r.id,
      r.nombre,
      COUNT(DISTINCT c.id) as total_clientes,
      COUNT(DISTINCT rep.id) as total_repartos,
      COALESCE(
        JSON_AGG(
          DISTINCT CASE 
            WHEN c.id IS NOT NULL THEN 
              JSON_BUILD_OBJECT(
                'id', c.id,
                'nombre', c.nombre,
                'direccion', c.direccion,
                'latitud', c.latitud,
                'longitud', c.longitud,
                'telefono', c.telefono,
                'activo', c.activo
              )
          END
        ) FILTER (WHERE c.id IS NOT NULL), '[]'::json
      ) as clientes_asignados
    FROM rutas r
    LEFT JOIN repartos rep ON r.id = rep.ruta_id
    LEFT JOIN reparto_cliente rc ON rep.id = rc.reparto_id
    LEFT JOIN clientes c ON rc.cliente_id = c.id
    GROUP BY r.id, r.nombre
    ORDER BY r.nombre ASC
  `);

  return result.map(row => ({
    ...row,
    clientes_asignados: Array.isArray(row.clientes_asignados) ? row.clientes_asignados : []
  }));
}

// Calcular distancia entre dos puntos usando fórmula de Haversine
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Optimizar ruta usando algoritmo del vecino más cercano
export async function optimizarRuta(rutaId: number, puntoInicio?: {lat: number, lon: number}): Promise<RutaOptimizada | null> {
  const rutaBase = await getRutaById(rutaId);
  if (!rutaBase) return null;

  const rutaStats = await getRutasWithStats();
  const ruta = rutaStats.find(r => r.id === rutaId);
  if (!ruta) return null;

  const clientes = ruta.clientes_asignados.filter(c => c.latitud && c.longitud);
  if (clientes.length === 0) {
    return {
      ...ruta,
      clientes_optimizados: [],
      distancia_total: 0,
      tiempo_estimado: 0
    };
  }

  // Punto de inicio (centro de distribución o primer cliente)
  const inicio = puntoInicio || {
    lat: clientes.reduce((sum, c) => sum + c.latitud!, 0) / clientes.length,
    lon: clientes.reduce((sum, c) => sum + c.longitud!, 0) / clientes.length
  };

  // Algoritmo del vecino más cercano
  const clientesOptimizados: ClienteOptimizado[] = [];
  const clientesPendientes = [...clientes];
  let posicionActual = inicio;
  let distanciaTotal = 0;

  for (let orden = 1; orden <= clientes.length; orden++) {
    let clienteMasCercano = clientesPendientes[0];
    let distanciaMinima = calcularDistancia(
      posicionActual.lat, posicionActual.lon,
      clienteMasCercano.latitud!, clienteMasCercano.longitud!
    );

    // Encontrar el cliente más cercano
    for (const cliente of clientesPendientes) {
      const distancia = calcularDistancia(
        posicionActual.lat, posicionActual.lon,
        cliente.latitud!, cliente.longitud!
      );
      
      if (distancia < distanciaMinima) {
        distanciaMinima = distancia;
        clienteMasCercano = cliente;
      }
    }

    // Agregar cliente optimizado
    clientesOptimizados.push({
      ...clienteMasCercano,
      orden_visita: orden,
      distancia_anterior: distanciaMinima,
      tiempo_estimado: distanciaMinima * 2 + 15 // 2 min/km + 15 min por visita
    });

    // Actualizar posición y totales
    posicionActual = {
      lat: clienteMasCercano.latitud!,
      lon: clienteMasCercano.longitud!
    };
    distanciaTotal += distanciaMinima;
    
    // Remover cliente de pendientes
    const index = clientesPendientes.indexOf(clienteMasCercano);
    clientesPendientes.splice(index, 1);
  }

  const tiempoTotal = clientesOptimizados.reduce((sum, c) => sum + c.tiempo_estimado, 0);

  return {
    ...ruta,
    clientes_optimizados: clientesOptimizados,
    distancia_total: Math.round(distanciaTotal * 100) / 100,
    tiempo_estimado: Math.round(tiempoTotal)
  };
}

// Asignar clientes automáticamente por zona geográfica
export async function asignarClientesPorZona(): Promise<{mensaje: string, asignaciones: any[]}> {
  const rutas = await getAllRutas();
  const clientes = await getAllClientes();
  const asignaciones: any[] = [];

  // Definir zonas geográficas basadas en coordenadas
  const zonas = [
    { rutaId: 1, nombre: 'Norte', latMin: -34.5, latMax: -34.55, lonMin: -58.5, lonMax: -58.4 },
    { rutaId: 2, nombre: 'Sur', latMin: -34.65, latMax: -34.7, lonMin: -58.5, lonMax: -58.4 },
    { rutaId: 3, nombre: 'Centro', latMin: -34.55, latMax: -34.65, lonMin: -58.5, lonMax: -58.4 }
  ];

  for (const cliente of clientes) {
    if (!cliente.latitud || !cliente.longitud) continue;

    const zonaAsignada = zonas.find(zona => 
      cliente.latitud! >= zona.latMin && cliente.latitud! <= zona.latMax &&
      cliente.longitud! >= zona.lonMin && cliente.longitud! <= zona.lonMax
    );

    if (zonaAsignada) {
      asignaciones.push({
        cliente: cliente.nombre,
        ruta: zonaAsignada.nombre,
        coordenadas: `${cliente.latitud}, ${cliente.longitud}`
      });
    }
  }

  return {
    mensaje: `Se procesaron ${asignaciones.length} asignaciones automáticas`,
    asignaciones
  };
}

// =====================================
// CRUD para REPARTOS
// =====================================

export async function getAllRepartos(filters?: RepartoFilters): Promise<Reparto[]> {
  let whereClause = 'WHERE 1=1';
  const params: any[] = [];
  let paramCount = 0;

  if (filters?.camion_id) {
    paramCount++;
    whereClause += ` AND camion_id = $${paramCount}`;
    params.push(filters.camion_id);
  }

  if (filters?.ruta_id) {
    paramCount++;
    whereClause += ` AND ruta_id = $${paramCount}`;
    params.push(filters.ruta_id);
  }

  const queryText = `
    SELECT * FROM repartos 
    ${whereClause}
    ORDER BY id DESC
  `;

  return await query<Reparto>(queryText, params);
}

export async function getRepartoById(id: number): Promise<Reparto | null> {
  const result = await query<Reparto>('SELECT * FROM repartos WHERE id = $1', [id]);
  return result[0] || null;
}

export async function createReparto(repartoData: CreateReparto): Promise<Reparto> {
  const result = await query<Reparto>(
    'INSERT INTO repartos (camion_id, ruta_id) VALUES ($1, $2) RETURNING *',
    [repartoData.camion_id, repartoData.ruta_id]
  );
  return result[0];
}

export async function updateReparto(id: number, repartoData: Partial<CreateReparto>): Promise<Reparto | null> {
  const fields = Object.keys(repartoData).filter(key => repartoData[key as keyof CreateReparto] !== undefined);
  
  if (fields.length === 0) {
    return await getRepartoById(id);
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
  const values = [id, ...fields.map(field => repartoData[field as keyof CreateReparto])];

  const result = await query<Reparto>(
    `UPDATE repartos SET ${setClause} WHERE id = $1 RETURNING *`,
    values
  );

  return result[0] || null;
}

export async function deleteReparto(id: number): Promise<boolean> {
  // Primero eliminar las relaciones en reparto_cliente
  await query('DELETE FROM reparto_cliente WHERE reparto_id = $1', [id]);
  
  // Luego eliminar el reparto
  const result = await query('DELETE FROM repartos WHERE id = $1', [id]);
  return result.length > 0;
}

// =====================================
// GESTIÓN de REPARTO-CLIENTE
// =====================================

export async function getClientesByRepartoId(repartoId: number): Promise<Cliente[]> {
  return await query<Cliente>(
    `SELECT c.* FROM clientes c 
     INNER JOIN reparto_cliente rc ON c.id = rc.cliente_id 
     WHERE rc.reparto_id = $1 
     ORDER BY c.nombre ASC`,
    [repartoId]
  );
}

export async function addClienteToReparto(repartoCliente: CreateRepartoCliente): Promise<void> {
  await query(
    'INSERT INTO reparto_cliente (reparto_id, cliente_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [repartoCliente.reparto_id, repartoCliente.cliente_id]
  );
}

export async function removeClienteFromReparto(repartoId: number, clienteId: number): Promise<void> {
  await query(
    'DELETE FROM reparto_cliente WHERE reparto_id = $1 AND cliente_id = $2',
    [repartoId, clienteId]
  );
}

// Función para obtener repartos con detalles completos
export async function getRepartosWithDetails(): Promise<RepartoWithDetails[]> {
  const repartos = await getAllRepartos();
  
  const repartosWithDetails: RepartoWithDetails[] = [];
  
  for (const reparto of repartos) {
    // Obtener camión
    const camion = reparto.camion_id ? await getCamionById(reparto.camion_id) : null;
    
    // Obtener ruta
    const ruta = reparto.ruta_id ? await getRutaById(reparto.ruta_id) : null;
    
    // Obtener clientes
    const clientes = await getClientesByRepartoId(reparto.id);
    
    repartosWithDetails.push({
      ...reparto,
      camion,
      ruta,
      clientes
    });
  }
  
  return repartosWithDetails;
}

// Función para obtener reparto con detalles por ID
export async function getRepartoWithDetailsById(id: number): Promise<RepartoWithDetails | null> {
  const reparto = await getRepartoById(id);
  if (!reparto) return null;
  
  // Obtener camión
  const camion = reparto.camion_id ? await getCamionById(reparto.camion_id) : null;
  
  // Obtener ruta
  const ruta = reparto.ruta_id ? await getRutaById(reparto.ruta_id) : null;
  
  // Obtener clientes
  const clientes = await getClientesByRepartoId(reparto.id);
  
  return {
    ...reparto,
    camion,
    ruta,
    clientes
  };
}

// Función para crear reparto completo con clientes
export async function createRepartoWithClientes(
  repartoData: CreateReparto, 
  clienteIds: number[]
): Promise<RepartoWithDetails> {
  // Crear el reparto
  const reparto = await createReparto(repartoData);
  
  // Agregar clientes al reparto
  for (const clienteId of clienteIds) {
    await addClienteToReparto({
      reparto_id: reparto.id,
      cliente_id: clienteId
    });
  }
  
  // Retornar con detalles completos
  const repartoCompleto = await getRepartoWithDetailsById(reparto.id);
  return repartoCompleto!;
}

// =====================================
// USUARIOS y AUTENTICACIÓN
// =====================================

export async function getUserByUsername(username: string): Promise<Usuario | null> {
  const result = await query<Usuario>('SELECT * FROM usuarios WHERE username = $1', [username]);
  return result[0] || null;
}

export async function getUserByEmail(email: string): Promise<Usuario | null> {
  const result = await query<Usuario>('SELECT * FROM usuarios WHERE email = $1', [email]);
  return result[0] || null;
}

export async function createUser(userData: CreateUsuario): Promise<Usuario> {
  const result = await query<Usuario>(
    `INSERT INTO usuarios (username, email, password, nombre_completo, created_at, updated_at)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING *`,
    [userData.username, userData.email, userData.password, userData.nombre_completo]
  );
  return result[0];
}

// =====================================
// ESTADÍSTICAS para DASHBOARD
// =====================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const [clientesTotal, camionesTotal, repartosTotal, rutasTotal] = await Promise.all([
    query<{count: string}>('SELECT COUNT(*) as count FROM clientes'),
    query<{count: string}>('SELECT COUNT(*) as count FROM camiones'),
    query<{count: string}>('SELECT COUNT(*) as count FROM repartos'),
    query<{count: string}>('SELECT COUNT(*) as count FROM rutas'),
  ]);

  const clientesActivos = await query<{count: string}>(
    "SELECT COUNT(*) as count FROM clientes WHERE estado = 'Activo'"
  );

  const camionesSinAsignar = await query<{count: string}>(
    'SELECT COUNT(*) as count FROM camiones WHERE id NOT IN (SELECT DISTINCT camion_id FROM repartos WHERE camion_id IS NOT NULL)'
  );

  return {
    totalClientes: parseInt(clientesTotal[0].count),
    totalCamiones: parseInt(camionesTotal[0].count),
    totalRepartos: parseInt(repartosTotal[0].count),
    totalRutas: parseInt(rutasTotal[0].count),
    clientesActivos: parseInt(clientesActivos[0].count),
    repartosHoy: 0, // TODO: implementar cuando tengamos fecha en repartos
    camionesSinAsignar: parseInt(camionesSinAsignar[0].count),
  };
}

// Exportar tipos para uso en componentes
export type { Cliente, CreateCliente, UpdateCliente, Camion, CamionWithStats, CreateCamion, UpdateCamion, Ruta, Reparto, RepartoWithDetails, CreateReparto, DashboardStats };