const mysql = require('mysql2');
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Tu configuración de MySQL
      // Nota: Cambiamos .configure por .createConnection ya que es el método real de la librería
      const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'tu_password',
        database: 'inventario_almacen_v2'
      });

      // Aquí puedes agregar tus tareas de base de datos si las necesitas...

      return config;
    },
  },
});

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // La URL local donde corre tu frontend de Vue.js
    chromeWebSecurity: false, // Desactiva restricciones de seguridad de Chrome
    setupNodeEvents(on, config) {
      // Tu configuración de MySQL u otros plugins 
    },
  },
});
