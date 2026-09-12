// Importa el módulo mysql2 para conectar y realizar consultas en la base de datos MySQL
const mysql = require('mysql2');

// Importa dotenv para leer las variables de entorno desde el archivo .env
const dotenv = require('dotenv');

// Carga las variables de entorno para que estén disponibles en process.env
dotenv.config();

// Creamos un pool de conexiones que es más eficiente para APIs
const pool = mysql.createPool({
  host: process.env.DB_HOST,          // Dirección del servidor de la base de datos (ej. localhost)
  user: process.env.DB_USER,          // Usuario con permisos para acceder a la base de datos
  password: process.env.DB_PASSWORD,  // Contraseña del usuario de la base de datos
  database: process.env.DB_NAME,      // Nombre de la base de datos a la que nos conectaremos
  waitForConnections: true,           // Si no hay conexiones libres, hace esperar a la petición en cola
  connectionLimit: 10,                // Número máximo de conexiones simultáneas en el pool
  queueLimit: 0                       // Número máximo de peticiones en cola (0 = sin límite) 
});

// Exporta el pool configurado para usar promesas, permitiendo el uso de async/await en las rutas
module.exports = pool.promise(); // Exportamos como promesa para usar async/await
