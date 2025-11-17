require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkRepartosStructure() {
  try {
    // Obtener estructura de la tabla
    const schemaResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'repartos' 
      ORDER BY ordinal_position
    `);
    
    console.log('Estructura de la tabla repartos:');
    schemaResult.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
    
    // Obtener algunos registros de ejemplo
    const dataResult = await pool.query('SELECT * FROM repartos LIMIT 5');
    console.log('\nEjemplos de registros:');
    console.table(dataResult.rows);
    
    // Contar total de registros
    const countResult = await pool.query('SELECT COUNT(*) FROM repartos');
    console.log(`\nTotal de repartos: ${countResult.rows[0].count}`);
    
  } catch (error) {
    console.error('Error al analizar tabla repartos:', error.message);
  } finally {
    await pool.end();
  }
}

checkRepartosStructure();