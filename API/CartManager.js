import crypto from 'crypto'; // importamos crypto
import fs from 'fs/promises'; // importamos file

const path = 'data/carts.json'

class CartManager{
    constructor(){
        this.lista=[];
    }

    async createCart(){
        const id = crypto.randomUUID() 
        const products = [];

        this.lista.push({
            id,
            products
        })

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

export default CartManager