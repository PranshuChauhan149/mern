import express from 'express';

import authSeller from '../middlewares/authSeller.js';
import { addProduct, changeStock, productById, productList } from '../controllers/ProductController.js';
import { upload } from '../config/multer.js';

const productRouter = express.Router();

// Add product (uploading multiple images)
productRouter.post("/add", upload.array('images'), authSeller, addProduct);

// Get list of all products
productRouter.get("/list", productList);

// Get product by ID
productRouter.get("/id", productById);
 
// Change stock (secured route, needs seller auth)
productRouter.post("/stock", authSeller, changeStock);

export default productRouter;
