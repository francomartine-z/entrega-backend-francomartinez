import express from 'express'; //importamos express
import handlebars from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import productsRouter from './routes/products.router.js';//importamos los routers de productos y carritos
import cartsRouter from './routes/carts.router.js'; //importamos los routers de productos y carritos
import viewsRouter from './routes/views.router.js'; //importamos el router de vistas
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import ProductModel from './models/products.model.js';
import dotenv from 'dotenv';

dotenv.config(); //cargamos las variables de entorno desde el archivo .env

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI) //conectamos a la base de datos de MongoDB utilizando la URL de conexión proporcionada
  .then(() => console.log("Conectado a MongoDB")) //si la conexión es exitosa, se muestra un mensaje en la consola indicando que se ha conectado a MongoDB
  .catch((error) => console.error("Error al conectar a MongoDB:", error)); //si hay un error al conectar a MongoDB, se muestra un mensaje de error en la consola con el detalle del error

const app = express(); // Configuración de app con express

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.engine('handlebars', handlebars.engine()); // Configuración de handlebars como motor de plantillas para renderizar vistas
app.set('view engine', 'handlebars'); 
app.set('views', path.join(__dirname, './views')); 

app.use(express.json()); // Middleware para parsear el cuerpo de las solicitudes como datos de formulario
app.use(express.urlencoded({ extended: true })); // Middleware para parsear el cuerpo de las solicitudes como datos de formulario

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

//pagina principal
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de productos');
});

const server = http.createServer(app);
const io = new Server(server);

app.set('io',io);

const PORT = 8080;

server.listen(PORT, () => {
  console.log(`API Productos: http://localhost:${PORT}/api/products`);
console.log(`API Carritos: http://localhost:${PORT}/api/carts`);

console.log(`Vista Productos: http://localhost:${PORT}/products`);
console.log(`Detalle Producto: http://localhost:${PORT}/products/:pid`);
console.log(`Vista Carrito: http://localhost:${PORT}/carts/:cid`);
});

io.on('connection', async (socket) => {
  console.log('Nuevo cliente conectado');

  const prod = await ProductModel.find().lean(); //obtiene la lista de productos de la base de datos utilizando el modelo de producto y la opcion "lean" para obtener los resultados como objetos JavaScript simples en lugar de documentos de Mongoose, lo que mejora el rendimiento al enviar los datos al cliente
  socket.emit('products', prod);
});