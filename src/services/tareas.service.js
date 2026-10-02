//ahora en este service vamos a aprender una nueva forma de implemnetar pero esta vez ya con datos reales asi
const repo = require('../repositories/tareas.postgres.repository');
async function listar() {
  return repo.findAll();
}

async function obtener(id) {
  return repo.findById(id);
}

async function crear(datos) {
  const datosPermitidos = {
    titulo: datos.titulo,
  };

  if (Object.hasOwn(datos, 'descripcion')) {
    datosPermitidos.descripcion = datos.descripcion;
  }

  return repo.create(datosPermitidos);
}

async function actualizar(id, cambios) {
  const cambiosPermitidos = {};

  if (Object.hasOwn(cambios, 'titulo')) {
    cambiosPermitidos.titulo = cambios.titulo;
  }

  if (Object.hasOwn(cambios, 'descripcion')) {
    cambiosPermitidos.descripcion = cambios.descripcion;
  }

  if (Object.hasOwn(cambios, 'completada')) {
    cambiosPermitidos.completada = cambios.completada;
  }

  return repo.update(id, cambiosPermitidos);
}

async function eliminar(id) {
  return repo.remove(id);
}

//ahora para que esto pueda ser usado vamos a exportarlo pero ya que lo que son funcionales exportamos los metodos ya sabes 
module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
};
//recuerda que en express los midlewares funciona d eesta forma como validadores de entrada y salida para ello esto funciona con el driver llamado zod el cual devemos instalarlo mediante el uso de node
