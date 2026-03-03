import { Router } from "express";
import ProductsManager from "../managers/ProductManager.js";

const router = Router();
const products = new ProductsManager();

router.get('/home', async (req, res) => {
    const productsList = await products.getProducts();
    res.render('home', { products: productsList });
});

router.get('/realtimeproducts', async (req, res) => {
    const productsList = await products.getProducts();
    res.render('realTimeProducts', { products: productsList });
});

export default router;