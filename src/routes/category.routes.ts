import { Router } from 'express';
import authorize from '@middleware/authorization';
import categoryCtrl from '@controller/category.controller';

const { getAllCategory, getCategoryById, createCategory, updateCategory } = categoryCtrl;

export const category = (router: Router): void => {
  router
    .route('/')
    .get(authorize(['admin', 'user']), getAllCategory)
    .post(authorize(['admin']), createCategory);

  router
    .route('/:id')
    .get(authorize(['admin', 'user']), getCategoryById)
    .put(authorize(['admin']), updateCategory);
};
