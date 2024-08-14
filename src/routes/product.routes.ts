import { Router } from 'express';
import authorize from '@middleware/authorization';
import productCtrl from '@controller/product.controller';

const { getAllProducts, getProductById, createProduct, updateProduct } = productCtrl;

export const product = (router: Router): void => {
  router
    .route('/')
    .get(authorize(['admin', 'user']), getAllProducts)
    .post(authorize(['admin']), createProduct);

  router
    .route('/:id')
    .get(authorize(['admin', 'user']), getProductById)
    .put(authorize(['admin']), updateProduct);
};
