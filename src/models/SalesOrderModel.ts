import { model, Schema, Types } from "mongoose";
import { logger } from "../../src/logger";

export interface ISalesOrder {
  products: {
    barcode: string;
    price: number;
    quantity: number;
  }[];

  saleDate: Date;
  source: "store";
}

const SalesOrderSchema = new Schema<ISalesOrder>(
  {
    products: [
      {
        barcode: { type: String, required: true},
        price: { type: Number, required: true, min: 1 },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],

    saleDate: { type: Date, required: true },
    source: { type: String, required: true, enum: ["store"], default: "store" },
  },
  { timestamps: true }
);

export const SalesOrder = model<ISalesOrder>("SalesOrder", SalesOrderSchema);
