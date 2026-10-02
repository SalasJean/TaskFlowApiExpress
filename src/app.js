//recuerda siempre que app.js es el que contruye la app si? porfavor
const express = require('express');
const app = express();
//le decimos que use json
app.use(express.json());
//ahora si empezamos a crear los endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
//ahora esto para que se pueda usar en otros modulos procedemos a exportar la app
const tareasRoutes = require('./routes/tareas.routes');
app.use('/tareas', tareasRoutes);
module.exports = app;
//este es el archivo que nos permite salir al exterior, mediante la exportacion de la app y la recepcion de las peticiones
// recuerda que app.js siempre pero siempre es el que crea y configura express
// registra midlewares
// monta los routers
// exporta al app
// mientras que el server.js se dedica a esto ->