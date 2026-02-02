import express from 'express';
import ProductsManager from './productManager.js';

const app = express();
app.use(express.json());
const PORT = 8080;

const products = new ProductsManager;

const carts = [];

//pagina principal
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de productos');
});


//PRODUCTOS
//endpoint para obtener todos los productos
 app.get('/api/products', async (req, res) => {
    const lista = await products.getProducts(); //utiliza el metodo getProducts() del ProductManager para poder llamar y usar los datos del json
    res.json({ status: 'success', data: lista })
})

//endpoint para obtener un producto por su id
app.get('/api/products/:pid',async (req, res) => { //convertimos la funcion en asincrona
  const pid = req.params.pid; //obtiene el parametro de la url "pid"

  lista = await products.getProducts(); // esperamos a que se carguen los archivos de getProducts 
  const product = products.find(p => p.id == pid); //busca un objeto que coincida con el id
  if (product) {
    res.json({ status: 'success', data: product });
  } else {
    res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
  }
})

app.post('/api/products', (req, res) => {
   const { title, description, code, price, status, stock, category, thumbnails } = req.body;
   const id = products.length + 1;
   products.push(
    {
        id,
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails
    }
   );
   res.json({ status: 'success', message: 'Producto agregado', data: products });       
});

app.put('/api/products/:pid', (req, res) => {
   const pid = Number(req.params.pid); 
   const index = products.findIndex(p => p.id === pid)
   if (index === -1){
    return res.status(404).json({
        status : 'error',
        message : 'Producto no encontrado'
    })
   }
   products[index] ={
    ...products[index],
    ...req.body,
    id : products[index].id
   }

   res.json({ status: 'success', message: 'Producto Actualizado', data: products[index] });       
});

app.delete('/api/products/:pid', (req, res) => {
   const pid = req.params.pid; 
   const index = products.findIndex(p => p.id == pid);
   if (index !== -1) {
    products.splice(index, 1);
    res.json({ status: 'success', message: 'Producto eliminado', data: products });
   } else {
    res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
   }
});

//CARRITO

app.get('/api/carts', (req, res) => {
  if (carts.length === 0) {
    res.json({ status: 'success', message: 'No hay carritos disponibles' });
  } else {
    res.json({ status: 'success', data: carts})
  }
})

app.post('/api/carts', (req, res) => {
    const cid = carts.length + 1;
    carts.push(
        {
            id: cid,
            products: [] 
        }
    );
    res.json({ status: 'success', message: 'Carrito creado', data: carts }); 
});
          

app.get('/api/carts/:cid', (req, res) => {
  const cid = req.params.cid;
  const cart = carts.find(c => c.id == cid);
  if (cart) {
    res.json({ status: 'success', data: cart });
  } else {
    res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
  }
});

app.post('/api/carts/:cid/products/:pid', (req, res) => {
    const {quantity = 1} = req.body; // cantidad por defecto 1
    const cid = req.params.cid; // id del carrito
    const pid = req.params.pid; // id del producto
    const cart = carts.find(c => c.id == cid); // busco el carrito por id
    if (cart) {// si el carrito existe
    const product = products.find(p => p.id == pid); // busco el producto por id
    if (product) {// si el producto existe
      const productInCart = cart.products.find(p => p.product == pid); // busco el producto en el carrito
      if (productInCart) {
        // si ya existe, incremento la cantidad
        productInCart.quantity += quantity;
        res.json({ status: 'success', message: 'Cantidad actualizada', data: cart });
      } else {
        // si no existe, lo agrego
        cart.products.push(
            {
                product: pid,
                quantity
            }
        );
        res.json({ status: 'success', message: 'Producto agregado al carrito', data: cart });
      }
    } else {
      res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }
  } else {
    res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  console.log(`Productos: http://localhost:${PORT}/API/products`);
});
