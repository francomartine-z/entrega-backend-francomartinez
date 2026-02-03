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
  const pid = req.params.pid; //obtiene el parametro de la url "pid".
  const lista = await products.getProducts(); // esperamos a que se carguen los archivos de getProducts 
  const product = lista.find(p => p.id == pid); //busca un objeto de la lista que coincida con el id
  if (product) {
    res.json({ status: 'success', data: product });
  } else {
    res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
  }
})

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

   await products.saveProducts(lista)

   res.json({ status: 'success', message: 'Producto Actualizado', data: lista[index] });       
});

app.delete('/api/products/:pid', async(req, res) => {
   const pid = req.params.pid; 
   const prod = await products.getProducts();
   const index = prod.findIndex(p => p.id === pid);
   if (index !== -1) {
    prod.splice(index, 1);
    await products.saveProducts(prod);
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
