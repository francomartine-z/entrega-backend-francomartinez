import { Router } from "express";
import ProductModel from "../models/products.model.js";
import CartModel from "../models/carts.model.js";

const router = Router();

//Products Views (principal)
router.get('/products', async (req, res) => {
    try {
        let { limit = 10, page =1, sort, query } = req.query; //obtiene los parametros de la url "limit", "page", "sort" y "query" con valores por defecto

        let filter = {}; //crea un objeto vacio para almacenar los filtros de busqueda, si no se proporciona el parametro "query", se devuelve todos los productos sin aplicar ningun filtro

        if (query) { //si hay un parametro query en la url.
            filter = {
                $or: [
                    { category : query }, //si se proporciona el parametro "query", se agrega un filtro de busqueda para el campo "category" utilizando una expresion regular para hacer una busqueda parcial e insensible a mayusculas
                    { status: query === "true" } //si cumple alguna de las condiciones, se devuelve el producto tanto como si el query es igual a la categoria o si el query es igual al status del producto.
                ]
            };
        }

        let options = {
            limit: parseInt(limit), //convierte el parametro "limit" a un numero entero para limitar la cantidad de productos devueltos por pagina
            page: parseInt(page), //convierte el parametro "page" a un numero entero para indicar la pagina actual de los resultados
        };

        if (sort) {
            options.sort = { price : sort === "asc" ? 1 : -1 }; //si se proporciona el parametro "sort", agrega una propiedad "sort" al objeto "options" para ordenar los resultados por el campo "price" en orden ascendente (1) o descendente (-1) dependiendo del valor del parametro "sort".
        }

        const result = await ProductModel.paginate(filter, {
            ...options,
            lean: true //agrega la opcion "lean" para obtener los resultados como objetos JavaScript simples en lugar de documentos de Mongoose, lo que mejora el rendimiento al renderizar la vista
        });//utiliza el metodo "paginate" del modelo de producto para obtener los productos filtrados y paginados segun los parametros recibidos

        res.render("products", {//renderiza la vista "products" y le pasa un objeto con los productos y la informacion de paginacion para mostrar en la vista
            products: result.docs, //los productos obtenidos de la base de datos
            prevLink: result.hasPrevPage ? `/products?page=${result.prevPage}` : null, // si hay una pagina anterior, se proporciona un enlace a esa pagina, de lo contrario, se devuelve null
            nextLink: result.hasNextPage ? `/products?page=${result.nextPage}` : null, // si hay una pagina siguiente, se proporciona un enlace a esa pagina, de lo contrario, se devuelve null
        });
    } catch (error) {
        res.status(500).send({
            status: "error",
            error: "Error al obtener los productos" //si hay un error al obtener los productos, se devuelve una respuesta con estado 500 y un mensaje de error
        });
    }
});

//PRODUCT DETAILS
router.get("/products/:pid", async (req, res) => {
   try {
    const product = await ProductModel.findById(req.params.pid).lean(); //utiliza el metodo "findById" del modelo

    res.render("productDetail", { product }); //renderiza la vista "productDetail" y le pasa el producto encontrado para mostrar sus detalles en la vista
   } catch (error) {
    res.status(500).send({
        status: "error",
        error: "Error al obtener el producto" //si hay un error al obtener el producto, se devuelve una respuesta con estado 500 y un mensaje de error
    });
   }
});

router.get("/carts/:cid", async (req, res) => {
    try {
        const cart = await CartModel.findById(req.params.cid)
        .populate('products.product')
        .lean(); //utiliza el metodo "findById" del modelo de carrito para buscar un carrito por su id en la base de datos, el metodo "populate" para reemplazar las referencias a los productos con los detalles completos de cada producto y la opcion "lean" para obtener el resultado como un objeto JavaScript simple en lugar de un documento de Mongoose, lo que mejora el rendimiento al renderizar la vista

        res.render("cart", { cart }); //renderiza la vista "cart" y le pasa el carrito encontrado para mostrar su contenido en la vista 
    } catch (error) {
        res.status(500).send({
            status: "error",
            error: "Error al obtener el carrito" //si hay un error al obtener el carrito, se devuelve una respuesta con estado 500 y un mensaje de error
        });
    }
})

export default router;