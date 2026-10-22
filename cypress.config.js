const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // La URL local donde corre tu frontend de Vue.js
    chromeWebSecurity: false, // Desactiva restricciones de seguridad de Chrome
    setupNodeEvents(on, config) {
      // Tu configuración de MySQL u otros plugins
      mysql.configure({
        host: 'localhost',
        user: 'root',
        password: 'tu_password',
        database: 'inventario_almacen_v2'
      }, on); 
    },
  },
});
