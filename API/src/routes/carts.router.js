import { Router} from "express";
import CartManager from '../managers/CartManager.js';
import ProductsManager from '../managers/ProductManager.js';

const router = Router();
const carts = new CartManager;
const products = new ProductsManager;

//CARRITO

router.get('/', async (req, res) => {
    const lista = await carts.getCarts();
  if (lista.length === 0) {
    res.json({ status: 'success', message: 'No hay carritos disponibles' });
  } else {
    res.json({ status: 'success', data: lista})
  }
})

router.post('/', async(req, res) => {
    try{
        const cartsData = req.body;
        await carts.createCart(cartsData); //Crea el carrito
        const lista = await carts.getCarts(); // carga los carritos
        res.json ({ status: 'success', message: 'Carritos cargados' , data : lista })
    } catch (err) {
        res.status(500).json({ status: 'error', message:'Error al enviar los archivos' })
    }
});
          

router.get('/:cid', async (req, res) => {
  const cid = req.params.cid;
  const lista = await carts.getCarts(); //carga los carritos
  const cart = lista.find(c => c.id == cid); //busca un objeto que coincida con el  id
  if (cart) {
    res.json({ status: 'success', data: cart.products });
  } else {
    res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
  }
});

router.post('/:cid/product/:pid', async(req, res) => {
    const cid = Number(req.params.cid); // id del carrito
    const pid = req.params.pid; // id del producto

    const cartsList = await carts.getCarts(); //carga los carritos
    const cart = cartsList.find(c => c.id === cid); // busco el carrito por id
    if (!cart) {// si el carrito no existe
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }

    const productsList = await products.getProducts() 
    const product = productsList.find(p => p.id === pid); // busco el producto por id
    if (!product) {// si el producto no existe
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }
    
    const productInCart = cart.products.find(p => p.product === pid); // busco el producto en el carrito
      if (productInCart) {
        // suma 1 a la cantidad del producto si ya existe en el carrito
        productInCart.quantity++;
      } else {
        // si no existe, lo agrego
        cart.products.push(
            {
                product: pid,
                quantity : 1
            }
        );
      }
    await carts.saveCarts(cartsList); // guardo los cambios en el json
    res.json({ status: 'success', message: 'Producto agregado al carrito', data: cart.products });
});

export default router