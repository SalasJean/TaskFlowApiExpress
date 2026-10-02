//aqui vamos a crear las entidades para que se use en la creacion de la logica de negocio y cruds respectivos
// recuerda siempre como se hace una funcion que en js sirve como una clase nunca lo olvides pofavor
function crearTarea({ id, titulo, descripcion = ' ' }) {
  //aqui retornamos algo pero como es largo casi siempre cuando se trabaja con entidades este es un objeto por ese se representa asi no lo olvides porfavor si?
  return {
    id,
    titulo,
    descripcion,
    completada: false,
    creadaEn: new Date().toISOString(),
  };
}
//AHORA EXPORTAMOS ESTO PARA QUE SE PUEDA USAR
module.exports = { crearTarea };
//recuerdaque en migrations estan todas las tablas que se inyectaran al motor de base de datos recuerda este a su vez es como un git pero para la base de datos ya que puede versionar la misma tabla varias veces no lo olvides si? porfavor 
// ademas recuerda que la numeracion de este nos indica el orden de ejecucion