import { Request, Response } from 'express';
import Cart from '@model/cart';
import handleErrorResponse from '@middleware/error-handler';

interface ICartController {
  getCartByUserId: (req: Request<{ userId: string }>, res: Response) => Promise<void>;
  addItemToCart: (req: Request, res: Response) => Promise<void>;
  removeItemFromCart: (req: Request<{ id: string }>, res: Response) => Promise<void>;
  updateItemQuantityInCart: (req: Request<{ id: string }>, res: Response) => Promise<void>;
}

const cartCtrl: ICartController = {
  getCartByUserId: async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
    try {
      const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.productId');
      if (!cart) {
        res.status(404).json({ error: 'Cart not found' });
        return;
      }
      res.status(200).json(cart);
    } catch (err) {
      handleErrorResponse(res, err);
    }
  },
  addItemToCart: async (req: Request, res: Response): Promise<void> => {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    try {
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }

      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }

      await cart.save();

      res.status(200).json({ message: 'Item added to cart successfully', cart });
    } catch (err) {
      handleErrorResponse(res, err);
    }
  },
  removeItemFromCart: async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    try {
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        res.status(404).json({ error: 'Cart not found' });
        return;
      }

      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
      await cart.save();

      res.status(200).json({ message: 'Item removed from cart successfully', cart });
    } catch (err) {
      handleErrorResponse(res, err);
    }
  },
  updateItemQuantityInCart: async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    try {
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        res.status(404).json({ error: 'Cart not found' });
        return;
      }

      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        res.status(200).json({ message: 'Item quantity updated successfully', cart });
      } else {
        res.status(404).json({ error: 'Item not found in cart' });
      }
    } catch (err) {
      handleErrorResponse(res, err);
    }
  },
};

export default cartCtrl;
