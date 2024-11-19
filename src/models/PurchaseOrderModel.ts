import { model, Schema, Types } from "mongoose";

export interface IPurchaseOrder {
  products: {
    barcode: string;
    quantity: number;
  }[];
  status: "Ordered" | "Pending" | "Arrived" | "Cancelled";
  orderDate: Date;
  receivedDate?: Date;
}

export const PurchaseOrderSchema = new Schema<IPurchaseOrder>({
  products: [
    {
      barcode: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],

  status: {
    type: String,
    required: true,
    enum: ["Ordered", "Pending", "Arrived", "Cancelled"],
  },
  orderDate: { type: Date, required: true },
  receivedDate: { type: Date },
});

export const PurchaseOrder = model<IPurchaseOrder>(
  "PurchaseOrder",
  PurchaseOrderSchema
);
