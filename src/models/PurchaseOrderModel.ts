import mongoose, { model, Schema } from "mongoose";

export interface IPurchaseOrder {
  products: {
    productId: string;
    name: string;
    size: string;
    quantity: number;
  }[];
  supplier: string;
  status: "Ordered" | "Arrived" | "Cancelled";
  orderDate: Date;
  receivedDate?: Date;
}

export const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    products: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        size: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],

    supplier: { type: String },
    status: {
      type: String,
      required: true,
      enum: ["Ordered", "Arrived", "Cancelled"],
      default: "Ordered",
    },
    orderDate: { type: Date, default: Date.now },
    receivedDate: { type: Date },
  },
  { timestamps: true }
);

export const PurchaseOrder = model<IPurchaseOrder>(
  "PurchaseOrder",
  PurchaseOrderSchema
);
