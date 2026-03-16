import mongoose from "mongoose"; //importamos mongoose para definir el esquema del carrito y crear el modelo de carrito

const cartSchema = new mongoose.Schema({ //definimos el esquema del carrito con los campos requeridos y sus tipos de datos
    products : [ //definimos un campo "products" que es un array de objetos, cada objeto representa un producto agregado al carrito
        {
            product: { //definimos un campo "product" que es un objeto con los detalles del producto agregado al carrito
                type : mongoose.Schema.Types.ObjectId, //el campo "product" es de tipo ObjectId, lo que significa que se refiere a un documento en la colección de productos
                ref : "products" //el campo "product" hace referencia al modelo de producto, lo que permite establecer una relación entre el carrito y los productos
            },
            quantity : Number //definimos un campo "quantity" que es de tipo Number, para almacenar la cantidad de ese producto específico agregado al carrito
        }
    ]
});

const CartModel = mongoose.model("carts", cartSchema); //creamos el modelo de carrito a partir del esquema definido

export default CartModel; //exportamos el modelo de carrito para utilizarlo en otras partes de la aplicación