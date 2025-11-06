import { config } from 'dotenv';
import pkg from 'pg';

const { Pool } = pkg;

// Cargar variables de entorno desde el proyecto Astro
config({ path: '../Astro/.env' });

console.log('🔍 Analizando estructura de base de datos...\n');

// Configuración de conexión a Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function analyzeDatabase() {
  let client;
  
  try {
    client = await pool.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Obtener todas las tablas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('📋 Tablas encontradas:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    console.log('');

    // Para cada tabla, obtener la estructura completa
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      
      console.log(`🗃️  TABLA: ${tableName.toUpperCase()}`);
      console.log('=' .repeat(50));

      // Obtener columnas con detalles
      const columnsResult = await client.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `, [tableName]);

      columnsResult.rows.forEach(col => {
        let typeInfo = col.data_type;
        
        if (col.character_maximum_length) {
          typeInfo += `(${col.character_maximum_length})`;
        } else if (col.numeric_precision) {
          typeInfo += `(${col.numeric_precision}${col.numeric_scale ? ',' + col.numeric_scale : ''})`;
        }

        const nullable = col.is_nullable === 'YES' ? '| null' : '';
        const defaultVal = col.column_default ? ` DEFAULT: ${col.column_default}` : '';

        console.log(`  ${col.column_name.padEnd(20)} ${typeInfo.padEnd(20)} ${nullable.padEnd(8)} ${defaultVal}`);
      });

      // Obtener claves primarias
      const pkResult = await client.query(`
        SELECT column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = $1 AND tc.constraint_type = 'PRIMARY KEY';
      `, [tableName]);

      if (pkResult.rows.length > 0) {
        console.log(`  🔑 PRIMARY KEY: ${pkResult.rows.map(r => r.column_name).join(', ')}`);
      }

      // Obtener claves foráneas
      const fkResult = await client.query(`
        SELECT 
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name = $1 AND tc.constraint_type = 'FOREIGN KEY';
      `, [tableName]);

      if (fkResult.rows.length > 0) {
        fkResult.rows.forEach(fk => {
          console.log(`  🔗 FOREIGN KEY: ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        });
      }

      // Obtener algunos registros de ejemplo
      const sampleResult = await client.query(`SELECT * FROM ${tableName} LIMIT 3`);
      if (sampleResult.rows.length > 0) {
        console.log(`  📊 REGISTROS DE EXAMPLE (${sampleResult.rows.length} de ${sampleResult.rowCount || 'N/A'}):`);
        sampleResult.rows.forEach((row, index) => {
          console.log(`    ${index + 1}. ${JSON.stringify(row, null, 2).substring(0, 200)}...`);
        });
      }

      console.log('\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

analyzeDatabase();