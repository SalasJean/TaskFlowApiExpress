//ahora procedemos a levantar el servidor
// aqui importamos la app que exportamos en app.js
require('dotenv').config();
const app = require('./app');
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
//recuerda que en terminos coloquiales este server.js es el archivo principal
// es el punto de entrada de la aplicacion
//recuerda que el server.js es el que carga el entorno de trabajo y lo mas importnate habre el puerto que se usara o usara el endpoint
// EL SERVER.JS SE DEDICA A ESTO RECUERDALO SI?
// ESTE EJECUTA LA APP LISTen junto al puerto, luego habre el puerto y levanta el servidor http