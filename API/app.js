import express from 'express';
import ProductsManager from './productManager.js';
import CartManager from './CartManager.js';

const app = express();
app.use(express.json());
const PORT = 8080;

const products = new ProductsManager;

const carts = new CartManager;

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
  const pid = req.params.pid; //obtiene el parametro de la url "pid".
  const lista = await products.getProducts(); // esperamos a que se carguen los archivos de getProducts 
  const product = lista.find(p => p.id == pid); //busca un objeto de la lista que coincida con el id
  if (product) {
    res.json({ status: 'success', data: product });
  } else {
    res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
  }
})


//endpoint para agregar un producto a products
app.post('/api/products', async (req, res) => {
    try{
        const productData = req.body //todos los datos que envia el usuario
        await products.createProducts(productData) //crea el producto en base a los datos enviados
        const lista = await products.getProducts(); //Obtenemos la lista actualizada
        res.json ({ status: 'success', message: 'Productos cargados' , data : lista })
    } catch {
        res.status(500).json({ status: 'error', message:'Error al enviar los archivos' })
    }
});

//endpoint para sobreescribir el producto
app.put('/api/products/:pid', async (req, res) => {
    const pid = (req.params.pid); 
    const lista = await products.getProducts(); //lee el producto
    const index = lista.findIndex(p => p.id === pid) // busca el producto que coincida con el pid:, si no lo encuentra devuelve -1
    
   //si el index es igual a -1 devuelve "producto no encontrado"
   if (index === -1){
    return res.status(404).json({
        status : 'error',
        message : 'Producto no encontrado'
    })
   }

   // sobre escribe todo el body del producto sin tocar el id
   lista[index] ={
    ...products[index],
    ...req.body,
    id : lista[index].id
   }

   await products.saveProducts(lista) //guarda los cambios en el json

   res.json({ status: 'success', message: 'Producto Actualizado', data: lista[index] });       
});


//endpoint para eliminar productos 
app.delete('/api/products/:pid', async(req, res) => {
   const pid = req.params.pid; 
   const prod = await products.getProducts(); //carga los productos
   const index = prod.findIndex(p => p.id === pid); // verifica que el producto del id exista sino devuelve -1
   if (index !== -1) { // si la respuesta es diferente a -1
    prod.splice(index, 1); //elimina el producto
    await products.saveProducts(prod); // guarda los datos en el json
    res.json({ status: 'success', message: 'Producto eliminado', data: products });
   } else {
    res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
   }
});

//CARRITO

app.get('/api/carts', async (req, res) => {
    const lista = await carts.getProducts();
  if (lista.length === 0) {
    res.json({ status: 'success', message: 'No hay carritos disponibles' });
  } else {
    res.json({ status: 'success', data: lista})
  }
})

app.post('/api/carts', async(req, res) => {
    try{
        const cartsData = req.body;
        await carts.createCart(cartsData); //Crea el carrito
        const lista = await carts.getProducts(); // carga los carritos
        res.json ({ status: 'success', message: 'Productos cargados' , data : lista })
    } catch {
        res.status(500).json({ status: 'error', message:'Error al enviar los archivos' })
    }
});
          

app.get('/api/carts/:cid', async (req, res) => {
  const cid = req.params.cid;
  const lista = await carts.getProducts(); //carga los carritos
  const cart = lista.find(c => c.id == cid); //busca un objeto que coincida con el  id
  if (cart) {
    res.json({ status: 'success', data: cart });
  } else {
    res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
  }
});

app.post('/api/carts/:cid/products/:pid', async(req, res) => {
    const {quantity = 1} = req.body; // cantidad por defecto 1
    const cid = req.params.cid; // id del carrito
    const pid = req.params.pid; // id del producto
    const cartsList = await carts.getProducts(); //carga los carritos
    const cart = cartsList.find(c => c.id == cid); // busco el carrito por id
    if (cart) {// si el carrito existe
    const prod = await products.getProducts()
    const product = prod.find(p => p.id == pid); // busco el producto por id
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
