import { Router } from "express";
import ProductsManager from '../managers/ProductManager.js';

const products = new ProductsManager;
const router = Router();

//PRODUCTOS
//endpoint para obtener todos los productos
 router.get('/', async (req, res) => {
    const lista = await products.getProducts(); //utiliza el metodo getProducts() del ProductManager para poder llamar y usar los datos del json
    res.json({ status: 'success', data: lista })
})

//endpoint para obtener un producto por su id
router.get('/:pid',async (req, res) => { //convertimos la funcion en asincrona
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
router.post('/', async (req, res) => {
   await products.createProducts(req.body); //utiliza el metodo createProducts() del ProductManager para agregar un producto al json, el producto se obtiene del body de la solicitud

   const prodList = await products.getProducts(); //utiliza el metodo getProducts() del ProductManager para obtener la lista actualizada de productos

   req.app.get('io').emit('products', prodList); //emite un evento a todos los clientes conectados con la lista actualizada de productos

    res.json({ message: 'Producto agregado', data: req.body }); //devuelve una respuesta con un mensaje y los datos del producto agregado
});

//endpoint para sobreescribir el producto
router.put('/:pid', async (req, res) => {
    const pid = (req.params.pid); 
    const lista = await products.getProducts(); //lee el producto
    const index = lista.findIndex(p => p.id == pid) // busca el producto que coincida con el pid:, si no lo encuentra devuelve -1
    
   //si el index es igual a -1 devuelve "producto no encontrado"
   if (index === -1){
    return res.status(404).json({
        status : 'error',
        message : 'Producto no encontrado'
    })
   }

   // sobre escribe todo el body del producto sin tocar el id
   lista[index] ={
    ...lista[index],
    ...req.body,
    id : lista[index].id
   }

   await products.saveProducts(lista) //guarda los cambios en el json

   res.json({ status: 'success', message: 'Producto Actualizado', data: lista[index] });       
});


//endpoint para eliminar productos 
router.delete('/:pid', async(req, res) => {
   const pid = req.params.pid; 
   const prod = await products.getProducts(); //carga los productos
   const index = prod.findIndex(p => p.id == pid); // verifica que el producto del id exista sino devuelve -1
   if (index !== -1) { // si la respuesta es diferente a -1
    prod.splice(index, 1); //elimina el producto
    await products.saveProducts(prod); // guarda los datos en el json
    res.json({ status: 'success', message: 'Producto eliminado', data: prod });
   } else {
    res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
   }
});



export default router

