import express from 'express'; //importamos express
import handlebars from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import productsRouter from './routes/products.router.js';//importamos los routers de productos y carritos
import cartsRouter from './routes/carts.router.js'; //importamos los routers de productos y carritos
import viewsRouter from './routes/views.router.js'; //importamos el router de vistas
import http from 'http';
import { Server } from 'socket.io';
import ProductsManager from './managers/ProductManager.js';

const products = new ProductsManager();
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

const PORT = 8080;


//pagina principal
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de productos');
});

const server = http.createServer(app);
const io = new Server(server);

app.set('io',io);

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  console.log(`Productos: http://localhost:${PORT}/api/products`);
  console.log(`Carritos: http://localhost:${PORT}/api/carts`);
  console.log(`Vistas: http://localhost:${PORT}/home`);
  console.log(`Real Time Products: http://localhost:${PORT}/realtimeproducts`);
});

io.on('connection', async (socket) => {
  console.log('Nuevo cliente conectado');

  const prod = await products.getProducts();
  socket.emit('products', prod);
});