//aqui vamos a trabajar desde el repository primero para empezar a madurar la logica de negocio para el service si porfavor recuerda
const pool = require('../config/database');
//recuerda que hay una forma mas versatil de poder hacer todo esto siendo la cual es mediante el nuevo metodo osea meditnate importaciones
//primero mapeamos la tarea
function mapearTarea(fila) {
  return {
    id: fila.id,
    titulo: fila.titulo,
    descripcion: fila.descripcion,
    completada: fila.completada,
    creadaEn: fila.creada_en.toISOString(),
  };
}
//ahora despues de haber mapeado procedemos a crear los metodos de contraro si?
async function findAll() {
  const resultado = await pool.query(`
      SELECT id, titulo, descripcion, completada, creada_en
      FROM tareas
      ORDER BY id ASC
    `);
  return resultado.rows.map(mapearTarea);
}

async function findById(id) {
  const resultado = await pool.query(
    `SELECT id, titulo, descripcion, completada, creada_en
     FROM tareas
     WHERE id = $1`,
    [id],
  );

  return resultado.rows[0] ? mapearTarea(resultado.rows[0]) : null;
}

async function create(datos) {
  const descripcion = datos.descripcion === undefined ? '' : datos.descripcion;
  const resultado = await pool.query(
    `INSERT INTO tareas (titulo, descripcion)
     VALUES ($1, $2)
     RETURNING id, titulo, descripcion, completada, creada_en`,
    [datos.titulo, descripcion],
  );

  return mapearTarea(resultado.rows[0]);
}

async function update(id, cambios) {
  const asignaciones = [];
  const valores = [];

  if (Object.hasOwn(cambios, 'titulo')) {
    valores.push(cambios.titulo);
    asignaciones.push(`titulo = $${valores.length}`);
  }

  if (Object.hasOwn(cambios, 'descripcion')) {
    valores.push(cambios.descripcion);
    asignaciones.push(`descripcion = $${valores.length}`);
  }

  if (Object.hasOwn(cambios, 'completada')) {
    valores.push(cambios.completada);
    asignaciones.push(`completada = $${valores.length}`);
  }

  if (asignaciones.length === 0) {
    return findById(id);
  }

  valores.push(id);
  const resultado = await pool.query(
    `UPDATE tareas
     SET ${asignaciones.join(', ')}
     WHERE id = $${valores.length}
     RETURNING id, titulo, descripcion, completada, creada_en`,
    valores,
  );

  return resultado.rows[0] ? mapearTarea(resultado.rows[0]) : null;
}

async function remove(id) {
  const resultado = await pool.query(
    `DELETE FROM tareas
     WHERE id = $1
     RETURNING id`,
    [id],
  );

  return resultado.rowCount > 0;
}

//ahora para que todo esto deva o pueda ser leido tenemos que exportar tambien todos los metodos asi
module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};