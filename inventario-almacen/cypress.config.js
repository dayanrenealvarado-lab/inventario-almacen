const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // <--- ESTO OBLIGA A CYPRESS A USAR TU VUE.JS
    setupNodeEvents(on, config) {
      
      // REGISTRAMOS LA TAREA DE CONEXIÓN A MYSQL
      on('task', {
        queryDb(query) {
          const connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Colomb14-2022', // Tu contraseña confirmada
            database: 'inventario_almacen_v2'
          });

          return new Promise((resolve, reject) => {
            connection.query(query, (error, results) => {
              if (error) {
                connection.end();
                return reject(error);
              }
              connection.end();
              return resolve(results);
            });
          });
        },
      });

      return config;
    },
  },
});

