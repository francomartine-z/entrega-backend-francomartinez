import { Router } from "express";
import ProductsManager from '../managers/ProductManager.js';
import ProductModel from "../models/products.model.js";

const products = new ProductsManager;
const router = Router();

//PRODUCTOS
//endpoint para obtener todos los productos
 router.get('/', async (req, res) => {
 let { limit = 10, page = 1, sort, query } = req.query; //obtiene los parametros de la url "limit", "page", "sort" y "query" con valores por defecto

 let filter = {}; //crea un objeto vacio para almacenar los filtros de busqueda, si no se proporciona el parametro "query", se devuelve todos los productos sin aplicar ningun filtro

 if (query) { //si se proporciona el parametro "query", se agrega un filtro de busqueda para el campo "category" utilizando una expresion regular para hacer una busqueda parcial e insensible a mayusculas
    filter = {
      $or: [ //si cumple alguna de las condiciones, se devuelve el producto tanto como si el query es igual a la categoria o si el query es igual al status del producto.
        {category: query },
        {status : query === "true" }
      ]
    }
 }

 let options = { //crea un objeto "options" para configurar la paginacion de los resultados utilizando el plugin "mongoose-paginate-v2"
  limit: parseInt(limit), //convierte el parametro "limit" a un numero entero para limitar la cantidad de productos devueltos por pagina
  page: parseInt(page), //convierte el parametro "page" a un numero entero para indicar la pagina actual de los resultados
 }

 if (sort) { //si se proporciona el parametro "sort"
  options.sort = { price: sort === "asc" ? 1 : -1 }; //agrega una propiedad "sort" al objeto "options" para ordenar los resultados por el campo "price" en orden ascendente (1) o descendente (-1) dependiendo del valor del parametro "sort".
 }

 const result = await ProductModel.paginate(filter, options); //utiliza el metodo "paginate" del modelo de producto para obtener los productos filtrados y paginados segun los parametros recibidos

 res.send({ //enviar la respuesta
  status: "success", // el estado de la respuesta es "success"
  payload :result.docs, // el payload de la respuesta contiene los productos
  totalPages: result.totalPages, // el numero total de paginas
  prevPage: result.prevPage, // la pagina anterior
  nextPage: result.nextPage, // la pagina siguiente
  page: result.page, // la pagina actual
  hasPrevPage: result.hasPrevPage, // indica si hay una pagina anterior
  hasNextPage: result.hasNextPage, // indica si hay una pagina siguiente
  prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}` : null, // si hay una pagina anterior, se proporciona un enlace a esa pagina, de lo contrario, se devuelve null
  nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}` : null // si hay una pagina siguiente, se proporciona un enlace a esa pagina, de lo contrario, se devuelve null
 });

});

//endpoint para obtener un producto por su id
router.get('/:pid',async (req, res) => { //convertimos la funcion en asincrona
 try {
  const { pid } = req.params; //obtiene el id del producto de los parametros de la url

  const product = await ProductModel.findById(pid); //utiliza el metodo "findById" del modelo de producto para buscar un producto por su id en la base de datos

  if (!product) {
    return res.status(404).send({
      status: 'error', //si no se encuentra el producto, se devuelve una respuesta con estado 404 y un mensaje de error
      message: 'Producto no encontrado'
    });
  }

  res.send({
    status: 'success', //si se encuentra el producto, se devuelve una respuesta con estado "success" y el producto encontrado en el payload
    payload: product
  });
 } catch (error) {
  res.status(500).json({ status: 'error', message: 'Error al obtener el producto' }); //si hay un error al obtener el producto, se devuelve una respuesta con estado 500 y un mensaje de error
}
})

//endpoint para agregar un producto a products
router.post('/', async (req, res) => {
  try {
    const product = req.body; //obtiene el producto del cuerpo de la solicitud

    const result = await ProductModel.create(product); //crea un nuevo producto en la base de datos utilizando el modelo de producto y los datos recibidos en el cuerpo de la solicitud
  
    res.send({
      status: 'success', //el estado de la respuesta es "success"
      payload: result //el payload de la respuesta contiene el producto creado
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al crear el producto' }); //si hay un error al crear el producto, se devuelve una respuesta con estado 500 y un mensaje de error
  }
});

//endpoint para sobreescribir el producto
router.put('/:pid', async (req, res) => {
    try{
        const { pid } = req.params; //obtiene el id del producto de los parametros de la url
        const updateData = req.body; //obtiene los datos actualizados del producto del cuerpo de la solicitud

        const result = await ProductModel.findByIdAndUpdate(
            pid, //el id del producto a actualizar
            updateData, //los datos actualizados del producto
            { new: true } //opcion para devolver el producto actualizado en la respuesta
        );

        if (!result) {
          return res.status(404).send({
            status: 'error', //si no se encuentra el producto, se devuelve una respuesta con estado 404 y un mensaje de error
            message: 'Producto no encontrado'
          });
        }

        res.send({
          status: 'success', //si se actualiza el producto, se devuelve una respuesta con estado "success" y el producto actualizado en el payload
          payload: result
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al actualizar el producto' }); //si hay un error al actualizar el producto, se devuelve una respuesta con estado 500 y un mensaje de error
    }
});


//endpoint para eliminar productos 
router.delete('/:pid', async(req, res) => {
   try {
      const { pid } = req.params; //obtiene el id del producto de los parametros de la url

      const result = await ProductModel.findByIdAndDelete(pid); //utiliza el metodo "findByIdAndDelete" del modelo de producto para eliminar un producto por su id en la base de datos

      if (!result) {
        return res.status(404).send({
          status: 'error', //si no se encuentra el producto, se devuelve una respuesta con estado 404 y un mensaje de error
          message: 'Producto no encontrado'
        });
      }
        res.send({
          status: "success", //si se elimina el producto, se devuelve una respuesta con estado "success" y el producto eliminado en el payload
          message: "Producto eliminado exitosamente",
        })
      }
    catch (error) {
      res.status(500).json({ status: 'error', message: 'Error al eliminar el producto' }); //si hay un error al eliminar el producto, se devuelve una respuesta con estado 500 y un mensaje de error
     }
   
});



export default router

