import { Router } from 'express';

import { auth } from './auth.routes';
import { cart } from './cart.routes';
import { category } from './category.routes';
import { order } from './order.routes';
import { product } from './product.routes';

const router: Router = Router();

const routes: {
  [key: string]: (router: Router) => void;
} = { auth, cart, category, order, product };

for (const route in routes) {
  const nestedRouter = Router();
  routes[route](nestedRouter);
  router.use(`/api/${route}`, nestedRouter);
}

export { router };
