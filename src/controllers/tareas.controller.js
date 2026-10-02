//este por ser el controller supongo que es el que maneja las salidas de los endpotins ya que este trabajara con res y req verdad? recuerda eso porfavor y recuerda tambien trabajar mediante el uso de bloques
//asi como el repository necesita de la data para funcionar u un service necesota del repo pues aqui el controller necesita del servicio ya que mediante el paradigma de desacoplamiento el controller no deveria de conocer nada de los detalles de la logica de negocio
const service = require('../services/tareas.service.js');
//esta forma es una de las formas correctas de llamar a un servicio no lo olvides si/ porfavor
// ahora si podemos desarrollarnos una vez traido el servicio en forma de una variable
//aqui vamos a aprender a usar de manera super extensiva los valores de req y res
// recuerda que en express esto se maneja de manera extensiva no lo olvides si? porfavor
// request o req es lo que entra en el servidor, recuerda
// miestras que response res es lo que sale del servidor, por eso cuando creamos metodos en la capa controlller en express pues en los metodos se implementa esto ya que la misma logica recibira o enviara informacion al user
//ahora de igual manera para manejar algo de asincronia y ademas de programacion funcional vamos a mejorar nuestro manejo de peticiones recuerda si?
async function listar(req, res) {
  const tareas = await service.listar();
  res.json(tareas);
}
//estamos usanod async y await con sus metodos de respuesta y recepcion al cliente recuerdalo si? y devolvemos al cliente todo esto en formato json.

//aqui como este metodo aqui en el controlador de enpoints seguimos con todos los demas recuerdalo si?
async function obtener(req, res) {
  const tarea = await service.obtener(Number(req.params.id));
  //aqui usamos param porque estamos obteniendo un dato en base a un id.
  if (!tarea) {
    return res.status(404).json({
      error: 'Tarea no encontrada',
    });
  }
  //ahora que devolvemos al cliente? pues le respondemos si todo sale bien el dato que esta buscando osea la tarea en formato json
  res.json(tarea);
}
//perfecto ahora lo mismo aplicamos al las demas funciones no lo olvides si?
async function crear(req, res) {
  //aqui si vamos a necesitar crear mediante el uso famoso del body de la peticion
  const tarea = await service.crear(req.body);
  //una vez instanciado metido esto dentro de una variable ahora podemos usar a nuestro gusto, para lo que queramos
  res.status(201).json(tarea);
}
//vamos con la funcion actualizar
async function actualizar(req, res) {
  const tarea = await service.actualizar(Number(req.params.id), req.body);
  //ahora le aplicamos la logica
  if (!tarea) return res.status(404)
    .json({ error: 'Tarea no encontrada' });
  res.json(tarea);
  //aqui estamos devolviendo no te olvides porfavor si?
}
//ahora pasamos con el metodo remove pue para este usamos param para encontrar su id y borrarlo
async function eliminar(req, res) {
  const borrada = await service.eliminar(Number(req.params.id));
  if (!borrada) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.status(204).send();
  //aqui estamos haciendo uso de un metodo con el tipo de respuesta que se espera, despues de esto procedemos a exportarlo para que pueda ser usado
}
module.exports = { listar, obtener, crear, actualizar, eliminar };

//despues de todo esto nos vamos a routes este es el que se encargara de llevar esto al exterior para que pueda ser ofrecido como si fuera una api
// ahora vamonos a los routes go!!!!!!!!!
//recuerda que en proyectos de node la carpeta public es la que el navegador necesita leer si o si si? porfavor no lo olvides y todo lo que el navegador no necesita leer deve ir afuera nunca lo olvides porfavor si/
// 