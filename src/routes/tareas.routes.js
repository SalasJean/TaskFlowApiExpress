//aqui es donde este vamos a mandarlo el mundo de internet recuerdalos si?
// 
//aqui vamos a llamar a todas las dependencias necesarias asi como el servidor y el iniciador de la app vamos !!!!!
const express = require('express');
const controller = require('../controllers/tareas.controller');

//ahora lo mas importante el router del metodo router el mas importante de express
// 
const router = express.Router();

//ahora vamos con la definicion d elas turas
router.get('/', controller.listar);
router.get('/:id', controller.obtener);
//recuerda que en este get por id estamos usando una variable dentro del name del enpoint esto es gracias al famoso param
router.post('/', controller.crear);
router.patch('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

//como estamos usando el metodo antiguo pues aqui vamos a exportar el router como si fuera un modulo recuerda
module.exports = router;
