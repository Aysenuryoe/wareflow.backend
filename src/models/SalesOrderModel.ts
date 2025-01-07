import mongoose, { model, Schema } from "mongoose";

export interface ISalesOrder {
  products: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  createdAt: Date;
}

const SalesOrderSchema = new Schema<ISalesOrder>(
  {
    products: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String },
        price: { type: Number, required: true, min: 1 },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    totalAmount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

SalesOrderSchema.pre("save", function (next) {
  this.totalAmount = this.products.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );
  next();
});

export const SalesOrder = model<ISalesOrder>("SalesOrder", SalesOrderSchema);
