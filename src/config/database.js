//aqui vamos a crear el pool de conexiones a la base de datos, para poder hacer consultas a la misma, de cada respectivo caso de uso
const { Pool } = require('pg');
//recuerda que pd esta siendo instalado como una dependencia desde package.json como dependencia no lo olvides porfavor si?
const pool = new Pool({
  //aqui le decimos de donde va a sacar las credenciales para conectarse de manera correcta a la base de datos si? no lo olvides porfavor
  connectionString: process.env.DATABASE_URL,
});
//COMO VERAS HAY YA SE DEFICION LA CONNECTION connectionString
// ahora procedemos a escuchar los errores inesperados de la primera conexion 
pool.on('error', (error) => {
  console.error('error inesperado en postgresql:', error);
});

//ahora exportamos todo esto para que pueda ser usado en otros archivos
module.exports = pool;