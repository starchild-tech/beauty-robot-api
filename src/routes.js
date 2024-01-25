import express from 'express';
const routes = express.Router();

// Controllers
import AuthController from './controllers/AuthController.js';
import ProductController from './controllers/ProductController.js';
import ProductStoreController from './controllers/ProductStoreController.js';
import StoreController from './controllers/StoreController.js';

// Auth
routes.get('/health', AuthController.getHealth);

// Product
routes.get('/product', ProductController.index);
routes.post('/product', ProductController.store);
routes.put('/product/:id', ProductController.update);

// ProductStore
routes.get('/product-store', ProductStoreController.index);
routes.post('/product-store', ProductStoreController.scrapData);

// Store
routes.get('/store', StoreController.index);
routes.post('/store', StoreController.store);
routes.put('/store/:id', StoreController.update);

export default routes;