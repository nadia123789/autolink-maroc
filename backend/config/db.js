const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'autolink_maroc',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+01:00',
  charset: 'utf8mb4',
});

// Test de connexion au démarrage
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connecté avec succès (XAMPP)');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Erreur connexion MySQL:', err.message);
    console.error('   Vérifiez que XAMPP est démarré et que la base "autolink_maroc" existe.');
  });

module.exports = pool;
