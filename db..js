const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Creamos un pool de conexiones que es más eficiente para APIs
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise(); // Exportamos como promesa para usar async/await
