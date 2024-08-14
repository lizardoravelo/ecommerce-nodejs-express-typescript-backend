import { Schema, model, Document, Types } from 'mongoose';

interface ICart extends Document {
  userId: Types.ObjectId;
  items: {
    productId: Types.ObjectId;
    quantity: number;
  }[];
}

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Cart = model<ICart>('Cart', cartSchema);

export default Cart;
