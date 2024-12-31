import { model, Schema } from "mongoose";

export interface IProduct {
  name: string;
  size: string;
  price: number;
  color: string;
  sku: string;
  stock: number;
  minStock?: number;
  description?: string;
}

export const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  size: {
    type: String,
    enum: [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "37",
      "38",
      "39",
      "40",
      "41",
      "42",
      "43",
      "44",
      "NOSIZE",
    ],
  },
  price: { type: Number, required: true },
  color: { type: String },
  sku: { type: String, unique: true },
  stock: { type: Number, required: true },
  minStock: { type: Number, default: 3 },
  description: { type: String },
});

export const Product = model<IProduct>("Product", ProductSchema);
