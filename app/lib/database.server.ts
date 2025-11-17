import { Pool } from 'pg';
import type { PoolClient } from 'pg';
import type { 
  Cliente, 
  CreateCliente, 
  UpdateCliente,
  Camion,
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
  RepartoFilters,
  Departamento,
  CreateDepartamento,
  Localidad,
  CreateLocalidad
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
      max: 20, // Aumentamos el número máximo de conexiones
      min: 2,  // Mantenemos algunas conexiones mínimas
      idleTimeoutMillis: 60000, // 1 minuto para conexiones idle
      connectionTimeoutMillis: 30000, // 30 segundos para conectar
      statement_timeout: 60000, // 60 segundos timeout para statements
      query_timeout: 60000, // 60 segundos timeout para queries
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    });
    
    pool.on('error', (err: Error) => {
      console.error('Error inesperado en el cliente de base de datos:', err);
    });
  }
  
  return pool;
}

// Función helper para ejecutar queries con retry
export async function query<T = any>(text: string, params?: any[], retries = 3): Promise<T[]> {
  const dbPool = getDbPool();
  let client: PoolClient | null = null;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      client = await dbPool.connect();
      const result = await client.query(text, params);
      return result.rows;
    } catch (error: any) {
      lastError = error;
      console.error(`Error en query de base de datos (intento ${attempt}/${retries}):`, error.message);
      
      if (client) {
        client.release(true); // Liberar conexión con error
        client = null;
      }
      
      // Si es un error de conexión y no es el último intento, esperar antes de reintentar
      if (attempt < retries && (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED' || error.message.includes('timeout'))) {
        console.log(`Reintentando en ${attempt * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        continue;
      }
      
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }
  
  throw lastError || new Error('Error desconocido en query');
}

// Función para cerrar todas las conexiones
export async function closeDbConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Función para verificar el estado de las conexiones
export function getPoolStats() {
  if (!pool) return null;
  
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

// Función para limpiar conexiones idle periódicamente (útil para desarrollo)
export async function cleanIdleConnections(): Promise<void> {
  if (pool) {
    console.log('🧹 Limpiando conexiones idle del pool...');
    const stats = getPoolStats();
    console.log('📊 Stats del pool antes:', stats);
    
    // No cerramos el pool completamente, solo forzamos limpieza de idle
    // Las conexiones idle se cerrarán automáticamente según idleTimeoutMillis
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
    latitud,
    sucursal,
    departamento,
    localidad
  } = clienteData;

  const result = await query<Cliente>(
    `INSERT INTO clientes (codigoalte, razonsocial, nombre, direccion, telefono, rut, estado, longitud, latitud, sucursal, departamento, localidad)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [codigoalte, razonsocial, nombre, direccion, telefono, rut, estado, longitud, latitud, sucursal, departamento, localidad]
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

export async function getRepartosByCamion(camionId: number): Promise<Reparto[]> {
  const result = await query<Reparto>(
    'SELECT * FROM repartos WHERE camion_id = $1 ORDER BY fecha_programada DESC, id DESC',
    [camionId]
  );
  return result;
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
// RUTAS - FUNCIONES DEPRECATED
// =====================================
// Las funciones de optimización fueron removidas por usar campos JSON complejos
// que causaban errores en PostgreSQL. Ahora solo mostramos datos básicos de BD.

// FUNCIÓN DEPRECADA: getRutasWithStats() - causaba errores con campos JSON

// FUNCIONES DEPRECATED: optimización y asignación automática eliminadas
// por usar tipos complejos que causaban errores en PostgreSQL

// =====================================
// CRUD para REPARTOS
// =====================================

export async function getAllRepartos(filters?: RepartoFilters): Promise<Reparto[]> {
  let whereClause = 'WHERE 1=1';
  const params: any[] = [];
  let paramCount = 0;

  if (filters?.camion_id) {
    paramCount++;
    whereClause += ` AND r.camion_id = $${paramCount}`;
    params.push(filters.camion_id);
  }

  if (filters?.ruta_id) {
    paramCount++;
    whereClause += ` AND r.ruta_id = $${paramCount}`;
    params.push(filters.ruta_id);
  }

  const queryText = `
    SELECT 
      r.id,
      r.camion_id,
      r.ruta_id,
      c.nombre as camion_nombre,
      rt.nombre as ruta_nombre
    FROM repartos r
    LEFT JOIN camiones c ON r.camion_id = c.id
    LEFT JOIN rutas rt ON r.ruta_id = rt.id
    ${whereClause}
    ORDER BY r.id DESC
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

// FUNCIÓN DEPRECADA: getRepartosWithDetails() 
// Ahora getAllRepartos() incluye los joins directamente

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
// CRUD para DEPARTAMENTOS y LOCALIDADES
// =====================================

export async function getAllDepartamentos(): Promise<Departamento[]> {
  return await query<Departamento>('SELECT * FROM departamentos ORDER BY descripcion ASC');
}

export async function getDepartamentoById(id: number): Promise<Departamento | null> {
  const result = await query<Departamento>('SELECT * FROM departamentos WHERE id = $1', [id]);
  return result[0] || null;
}

export async function createDepartamento(departamentoData: CreateDepartamento): Promise<Departamento> {
  const result = await query<Departamento>(
    'INSERT INTO departamentos (descripcion) VALUES ($1) RETURNING *',
    [departamentoData.descripcion]
  );
  return result[0];
}

export async function getAllLocalidades(): Promise<Localidad[]> {
  return await query<Localidad>(
    `SELECT l.*, d.descripcion as departamento_nombre 
     FROM localidades l 
     INNER JOIN departamentos d ON l.departamento_id = d.id 
     ORDER BY d.descripcion ASC, l.descripcion ASC`
  );
}

export async function getLocalidadesByDepartamento(departamentoId: number): Promise<Localidad[]> {
  return await query<Localidad>(
    'SELECT * FROM localidades WHERE departamento_id = $1 ORDER BY descripcion ASC',
    [departamentoId]
  );
}

export async function createLocalidad(localidadData: CreateLocalidad): Promise<Localidad> {
  const result = await query<Localidad>(
    'INSERT INTO localidades (departamento_id, descripcion) VALUES ($1, $2) RETURNING *',
    [localidadData.departamento_id, localidadData.descripcion]
  );
  return result[0];
}

// Función para obtener estadísticas de clientes por ubicación
export async function getClientesByUbicacion(): Promise<any[]> {
  return await query<any>(`
    SELECT 
      departamento,
      localidad,
      COUNT(*) as total_clientes,
      COUNT(CASE WHEN longitud IS NOT NULL AND latitud IS NOT NULL THEN 1 END) as con_coordenadas,
      COUNT(CASE WHEN estado = 'Activo' THEN 1 END) as activos
    FROM clientes 
    WHERE departamento IS NOT NULL 
    GROUP BY departamento, localidad
    ORDER BY departamento, localidad
  `);
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
  try {
    // Usar una sola query con CTEs para obtener todas las estadísticas de una vez
    const statsQuery = `
      WITH stats AS (
        SELECT 
          (SELECT COUNT(*) FROM clientes) as total_clientes,
          (SELECT COUNT(*) FROM clientes WHERE estado = 'Activo') as clientes_activos,
          (SELECT COUNT(*) FROM camiones) as total_camiones,
          (SELECT COUNT(*) FROM repartos) as total_repartos,
          (SELECT COUNT(*) FROM rutas) as total_rutas,
          (SELECT COUNT(*) FROM camiones WHERE id NOT IN (
            SELECT DISTINCT camion_id FROM repartos WHERE camion_id IS NOT NULL
          )) as camiones_sin_asignar
      )
      SELECT * FROM stats;
    `;

    const result = await query<{
      total_clientes: string;
      clientes_activos: string;
      total_camiones: string;
      total_repartos: string;
      total_rutas: string;
      camiones_sin_asignar: string;
    }>(statsQuery);

    if (!result || result.length === 0) {
      // Valores por defecto si no hay datos
      return {
        totalClientes: 0,
        totalCamiones: 0,
        totalRepartos: 0,
        totalRutas: 0,
        clientesActivos: 0,
        repartosHoy: 0,
        camionesSinAsignar: 0,
      };
    }

    const stats = result[0];

    return {
      totalClientes: parseInt(stats.total_clientes) || 0,
      totalCamiones: parseInt(stats.total_camiones) || 0,
      totalRepartos: parseInt(stats.total_repartos) || 0,
      totalRutas: parseInt(stats.total_rutas) || 0,
      clientesActivos: parseInt(stats.clientes_activos) || 0,
      repartosHoy: 0, // TODO: implementar cuando tengamos fecha en repartos
      camionesSinAsignar: parseInt(stats.camiones_sin_asignar) || 0,
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
    
    // Retornar estadísticas por defecto en caso de error
    return {
      totalClientes: 0,
      totalCamiones: 0,
      totalRepartos: 0,
      totalRutas: 0,
      clientesActivos: 0,
      repartosHoy: 0,
      camionesSinAsignar: 0,
    };
  }
}

// Exportar tipos para uso en componentes
export type { 
  Cliente, CreateCliente, UpdateCliente, 
  Camion, CreateCamion, UpdateCamion, 
  Ruta, Reparto, RepartoWithDetails, CreateReparto, 
  DashboardStats, Departamento, CreateDepartamento, 
  Localidad, CreateLocalidad 
};