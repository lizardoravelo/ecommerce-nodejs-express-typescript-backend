import { Router } from 'express';
import authorize from '@middleware/authorization';
import orderCtrl from '@controller/order.controller';

const { createOrder, getAllOrders, getOrderById, updateOrderWithDetail, deleteOrder } = orderCtrl;

export const order = (router: Router): void => {
  router
    .route('/')
    .get(authorize(['admin', 'user']), getAllOrders)
    .post(authorize(['admin', 'user']), createOrder);

  router
    .route('/:id')
    .get(authorize(['admin', 'user']), getOrderById)
    .put(authorize(['admin']), updateOrderWithDetail)
    .delete(authorize(['admin']), deleteOrder);
};
