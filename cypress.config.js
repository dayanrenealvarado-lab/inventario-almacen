const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // Es buena práctica definirlo aquí
    chromeWebSecurity: false, // Desactiva restricciones de seguridad de Chrome
    setupNodeEvents(on, config) {
      // Tu configuración de MySQL u otros plugins 
    },
  },
});
