import crypto from 'crypto'; // importamos crypto
import fs from 'fs/promises'; // importamos file


const path = 'data/products.json'

class ProductsManager{
    constructor(){
        this.lista=[]; // array con la lista a llenar
    }

    async createProducts(product){
        const id = crypto.randomUUID() //genera un id de manera que este no de repita
        const { title, description, code, price, status, stock, category, thumbnails } = product;
        this.lista.push( // agrega los parametros a la lista
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
        
        const text = JSON.stringify(this.lista, null, 2); //convierte la lista a un formato json

        await fs.writeFile(path, text); //agrega el text a la ruta del json
    }
    
    async getProducts(){
        try{
            const data= await fs.readFile(path, 'utf-8'); //lee el archivo y lo devuelve
            this.lista= JSON.parse(data); // parsea la data para que se pueda usar en formato js
            return this.lista
        } catch (err){
            return[]
        }
    } 
    
    async saveProducts(lista){ // Sobre escribe el json sin agregar otro objeto al array
        const text = JSON.stringify(lista, null, 2);
        await fs.writeFile(path, text);
    }
}

const manager= new ProductsManager()


export default ProductsManager