const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const result = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'rutas' ORDER BY ordinal_position");
    console.log('Estructura de la tabla rutas:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
    
    const sample = await pool.query('SELECT * FROM rutas LIMIT 5');
    console.log('\nEjemplos de registros:');
    console.table(sample.rows);
    
    const count = await pool.query('SELECT COUNT(*) FROM rutas');
    console.log(`\nTotal de rutas: ${count.rows[0].count}`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    pool.end();
  }
})();