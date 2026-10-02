### RECUERDA QUE EL PRIMERO PASO PARA TRABAJAR CON EXPRESS JS VAINILLA ES NECESARIO ESTOS PASOS CORRECTOS 
mkdir nombre de la app
cd mi-api
npm init -y
npm install express

# este descarga express y sus dependencias
# crea node modules
# crea el package lock
# agrega express al proyecto

### Un detalle importante
Como usas JS vainilla (sin TypeScript), no necesitas instalar tipos ni compilador, solo Express y lo que vayas necesitando después (ej: dotenv para leer tu .env, nodemon para desarrollo, etc.):

bash
npm install dotenv
npm install -D nodemon

(el -D es para dependencias que solo usas en desarrollo, no en producción)

¿Quieres que armemos juntos la estructura mínima de archivos para tu API (server.js, rutas, etc.)?

# PREGUNTA SERIA PARA QUE SIRVE NODEMON?
este sirve para reiniciar el servidor de manera automatica cada  vez que detencta un cambio en el código.