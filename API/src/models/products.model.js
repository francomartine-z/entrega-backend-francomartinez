import mongoose from "mongoose"; //importamos mongoose para definir el esquema del producto y crear el modelo de producto
import mongoosePaginate from "mongoose-paginate-v2"; //importamos mongoose-paginate-v2 para agregar paginación a los productos

const productSchema = new mongoose.Schema({ //definimos el esquema del producto con los campos requeridos y sus tipos de datos
    title : String,
    description : String,
    code : String,
    price : Number,
    status : Boolean,
    stock : Number,
    category : String,
    thumbnails : [String]
});

productSchema.plugin(mongoosePaginate); //agregamos el plugin de paginación al esquema del producto

const ProductModel = mongoose.model("products", productSchema); //creamos el modelo de producto a partir del esquema definido

export default ProductModel; //exportamos el modelo de producto para utilizarlo en otras partes de la aplicación