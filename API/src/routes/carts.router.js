import { Router} from "express";
import CartManager from '../managers/CartManager.js';
import ProductsManager from '../managers/ProductManager.js';
import CartModel from "../models/carts.model.js";
import ProductModel from "../models/products.model.js";

const router = Router();
const carts = new CartManager;
const products = new ProductsManager;

//CARRITO

router.get('/', async (req, res) => {
  try{
    const carts = await CartModel.find().populate('products.product'); //utiliza el metodo "find" del modelo de carrito para obtener todos los carritos de la base de datos y el metodo "populate" para reemplazar las referencias a los productos con los detalles completos de cada producto
  
    res.send({
      status: 'success', //el estado de la respuesta es "success"
      payload: carts //el payload de la respuesta contiene la lista de carritos obtenida
    });
  } catch(error) {
    res.status(500).send({
      status: 'error',
      error: 'Error al obtener los carritos' //si hay un error al obtener los carritos, se devuelve una respuesta con estado 500 y un mensaje de error
    });
    }
})

//endpoint para crear un nuevo carrito
router.post('/', async(req, res) => {
    try{
        const newCart = await CartModel.create({ products: []}); //crea un nuevo carrito en la base de datos utilizando el modelo de carrito y un objeto con un array vacío de productos como datos iniciales

        res.send({
          status:"success", //el estado de la respuesta es "success"
          payload: newCart //el payload de la respuesta contiene el carrito creado
        })
    } catch (error) {
      res.status(500).send({
        status: "error",
        error: "Error al crear el carrito"
      });
    }
});

//endpoint para obtener un carrito por su id
router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params; //obtiene el id del carrito de los parametros de la url

    const cart = await CartModel.findById(cid).populate('products.product'); //utiliza el metodo "findById" del modelo

    if (!cart) {
      return res.status(404).send({
        status: "error",
        error : "Carrito no encontrado" //si no se encuentra el carrito, se devuelve una respuesta con estado 404 y un mensaje de error
      })
    }

    res.send({
      status: "success", //si se encuentra el carrito, se devuelve una respuesta con estado "success" y el carrito encontrado en el payload
      payload: cart
    });
  } catch (error) {
    res.status(500).send({
      status: "error",
      error: "Error al obtener el carrito" //si hay un error al obtener el carrito, se devuelve una respuesta con estado 500 y un mensaje de error
    });
  }
});

//endpoint para agregar un producto a un carrito
router.post('/:cid/product/:pid', async(req, res) => {
    try {
        const { cid, pid } = req.params; // obtiene el id del carrito y el id del producto de los parametros de la url
        
        // Buscar carrito
        const cart = await CartModel.findById(cid); //utiliza el metodo "findById" del modelo de carrito para buscar un carrito por su id en la base de datos
        if (!cart){
          return res.status(404).send({
            status: "error",
            error: "Carrito no encontrado"
          });
        }

        // Verificar producto
        const product = await ProductModel.findById(pid); //utiliza el metodo "findById" del modelo de producto para buscar un producto por su id en la base de datos
        if (!product) {
          return res.status(404).send({
            status: "error",
            error: "Producto no encontrado"
          });
        }

        // Verificar si el producto ya está en el carrito
        const productInCart = cart.products.find(
          p=> p.product.toString() === pid //busca en el array de productos del carrito si ya existe un producto con el mismo id que el producto que se quiere agregar, utilizando el metodo "find" y comparando los ids como strings
        );

        if (productInCart){ // si el producto esta dentro del carrito
          productInCart.quantity += 1; //incrementa la cantidad del producto
        } else { //si el producto no esta dentro del carrito
          cart.products.push({
            product: pid,
            quantity: 1
          });
        }

        // Guardar los cambios
        await cart.save() //guarda los cambios realizados en el carrito utilizando el metodo "save" del modelo de carrito

        res.send({
          status: "success",
          message: "Producto agregado al carrito.",
          payload: cart //el payload de la respuesta contiene el carrito actualizado con el producto agregado
        });
      } catch(error){
        res.status(500).send({
          status: "error",
          error: "error al agregar el producto al carrito"
        });
      }
    });


router.put('/:cid', async (req, res) => {
  try{
    const { cid, pid } = req.params;
    const { products } = req.body; //obtiene el array de productos actualizado del cuerpo de la solicitud

    const cart = await CartModel.findById(cid);

    if (!cart) {
      return res.status(404).send({
        status: "error",
        error: "Carrito no encontrado"
      });
    }

    // reemplazar todo el carrito
    cart.products = products; //reemplaza el array de productos del carrito con el nuevo array de productos recibido en el cuerpo de la solicitud

    await cart.save();

    res.send({
      status: "success",
      message: "Carrito actualizado.",
      payload: cart
    });
  } catch (error) {
    res.status(500).send({
      status: "error",
      error: "Error al actualizar el carrito"
    });
  }
});

router.put('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body; //obtiene la cantidad actualizada del producto del cuerpo de la solicitud

    const cart = await CartModel.findById(cid);

    if (!cart) {
      return res.status(404).send({
        status: "error",
        error: "Carrito no encontrado"
      });
    }

    const productInCart = cart.products.find(
      p => p.product.toString() === pid //busca en el array de productos del carrito el producto que coincide con el id del producto que se quiere actualizar, utilizando el metodo "find" y comparando los ids como strings
    );

    if (!productInCart) {
      return res.status(404).send({
        status: "error",
        error: "Producto no encontrado en el carrito"
      });
    }

    //actualizar la cantidad del producto en el carrito
    productInCart.quantity = quantity; //actualiza la cantidad del producto en el carrito con el valor recibido en el cuerpo de la solicitud

    await cart.save();

    res.send({
      status: "success",
      message: "Cantidad del producto actualizada en el carrito.",
      payload: cart 
    });
  } catch (error) {
    res.status(500).send({
      status: "error",
      error: "Error al actualizar la cantidad del producto en el carrito"
    });
  }
});

//endpoint para eliminar un producto de un carrito
router.delete("/:cid/product/:pid", async (req, res) => {
      try {
        const { cid, pid } = req.params;
        
        const cart = await CartModel.findById(cid);

        if (!cart) {
          return res.status(404).send({
            status: "error",
            error: "Carrito no encontrado"
          });
        }

        //filtrar productos(eliminar el que coincida)
        cart.products = cart.products.filter(
          p => p.product.toString() !== pid //filtra el array de productos del carrito para eliminar el producto que coincida con el id del producto que se quiere eliminar, utilizando el metodo "filter" y comparando los ids como strings
        );

        await cart.save(); //guarda los cambios

        res.send({
          status: "succes",
          message: "Producto eliminado del carrito",
          payload: cart
        });  
      } 
        catch (error) {
        res.status(500).send({
          status: "error",
          error: "Error al eliminar el producto del carrito"
        })
      }
    })

    
export default router