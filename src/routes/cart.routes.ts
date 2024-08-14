import { Router } from 'express';
import authorize from '@middleware/authorization';
import cartCtrl from '@controller/cart.controller';

const { getCartByUserId, addItemToCart, removeItemFromCart, updateItemQuantityInCart } = cartCtrl;

export const cart = (router: Router): void => {
  router
    .route('/')
    .get(authorize(['user', 'admin']), getCartByUserId)
    .post(authorize(['user', 'admin']), addItemToCart)
    .put(authorize(['user', 'admin']), updateItemQuantityInCart)
    .delete(authorize(['user', 'admin']), removeItemFromCart);
};
