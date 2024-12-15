import mongoose, { Schema, Types, model } from "mongoose";

export interface IGoodsReceipt {
  purchaseOrderId: Types.ObjectId;
  products: {
    productId: string;
    name: string;
    size: string;
    receivedQuantity: number;
    discrepancies?: string;
  }[];
  receivedDate: Date;
  status: "Pending" | "Completed" | "Partial";
  remarks?: string;
}

const GoodsReceiptSchema = new Schema<IGoodsReceipt>(
  {
    purchaseOrderId: {
      type: Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        size: { type: String, required: true },
        receivedQuantity: { type: Number, required: true, min: 0 },
        discrepancies: { type: String },
      },
    ],
    receivedDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Partial"],
      default: "Pending",
    },
    remarks: { type: String },
  },
  { timestamps: true }
);

export const GoodsReceipt = model<IGoodsReceipt>(
  "GoodsReceipt",
  GoodsReceiptSchema
);
