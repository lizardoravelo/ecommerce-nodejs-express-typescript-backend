import { Request, Response } from 'express';
import Order from '@model/order';
import OrderDetail from '@model/order-detail';
import handleErrorResponse from '@middleware/error-handler';

interface IOrderDetail {
  productId: string;
  quantity: number;
  price: number;
}

interface IOrderController {
  createOrder: (req: Request, res: Response) => Promise<void>;
  getAllOrders: (req: Request, res: Response) => Promise<void>;
  getOrderById: (req: Request<{ id: string }>, res: Response) => Promise<void>;
  updateOrderWithDetail: (req: Request<{ id: string }>, res: Response) => Promise<void>;
  deleteOrder: (req: Request<{ id: string }>, res: Response) => Promise<void>;
}

const orderCtrl: IOrderController = {
  createOrder: async (req: Request, res: Response): Promise<void> => {
    const { user, totalAmount, status, paymentMethod, shippingAddress, orderDetails } = req.body;

    if (!user || !totalAmount || !status || !paymentMethod || !shippingAddress || !orderDetails) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const session = await Order.startSession();
    session.startTransaction();

    try {
      const newOrder = new Order({
        user,
        totalAmount,
        status,
        paymentMethod,
        shippingAddress,
      });

      await newOrder.save({ session });

      const newOrderDetails = orderDetails.map((detail: IOrderDetail) => ({
        orderId: newOrder._id,
        productId: detail.productId,
        quantity: detail.quantity,
        price: detail.price,
      }));

      await OrderDetail.insertMany(newOrderDetails, { session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        message: 'Order and Order Details Created Successfully',
        order: newOrder,
        orderDetails: newOrderDetails,
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      handleErrorResponse(res, err);
    }
  },

  getAllOrders: async (req: Request, res: Response): Promise<void> => {
    try {
      const orders = await Order.find().populate('user status paymentMethod');
      const orderDetails = await OrderDetail.find();

      const ordersWithDetails = orders.map((order: any) => ({
        ...order.toObject(),
        details: orderDetails.filter(detail => detail.orderId.toString() === order._id.toString()),
      }));

      res.status(200).json(ordersWithDetails);
    } catch (err) {
      handleErrorResponse(res, err);
    }
  },

  getOrderById: async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const order = await Order.findById(req.params.id).populate('user status paymentMethod');
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      const orderDetails = await OrderDetail.find({ orderId: order._id });
      res.status(200).json({
        ...order.toObject(),
        details: orderDetails,
      });
    } catch (err) {
      handleErrorResponse(res, err);
    }
  },

  updateOrderWithDetail: async (req: Request, res: Response): Promise<void> => {
    const { user, totalAmount, status, paymentMethod, shippingAddress, orderDetails } = req.body;

    if (!user || !totalAmount || !status || !paymentMethod || !shippingAddress || !orderDetails) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const session = await Order.startSession();
    session.startTransaction();

    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        { user, totalAmount, status, paymentMethod, shippingAddress },
        { new: true, runValidators: true, session },
      );

      if (!updatedOrder) {
        await session.abortTransaction();
        session.endSession();
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      await OrderDetail.deleteMany({ orderId: req.params.id }, { session });

      const newOrderDetails = orderDetails.map((detail: IOrderDetail) => ({
        orderId: updatedOrder._id,
        productId: detail.productId,
        quantity: detail.quantity,
        price: detail.price,
      }));

      await OrderDetail.insertMany(newOrderDetails, { session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        message: 'Order and Order Details Updated Successfully',
        order: updatedOrder,
        orderDetails: newOrderDetails,
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      handleErrorResponse(res, err);
    }
  },

  deleteOrder: async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const session = await Order.startSession();
    session.startTransaction();

    try {
      const order = await Order.findByIdAndDelete(req.params.id, { session });
      if (!order) {
        await session.abortTransaction();
        session.endSession();
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      await OrderDetail.deleteMany({ orderId: order._id }, { session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ message: 'Order and Order Details Deleted Successfully' });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      handleErrorResponse(res, err);
    }
  },
};

export default orderCtrl;
