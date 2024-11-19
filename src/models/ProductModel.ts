import { model, Schema } from "mongoose";
import { logger } from "../../src/logger";

export interface IProduct {
  article: string;
  size: string;
  barcode: string;
  price: number;
  productNum: string;
  stock: number;
  description?: string;
}

export const ProductSchema = new Schema<IProduct>(
  {
    article: { type: String, required: true },
    size: {
      type: String,
      enum: ["XS", "S", "M", "L", "XL", "NOSIZE"],
      set: (value: string) => value.toUpperCase(),
      required: true,
    },
    barcode: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v: string) {
          return v.length === 6;
        },
        message: "Barcode must be exactly 6 characters long.",
      },
    },
    price: { type: Number, required: true, min: 1 },
    productNum: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 10,
    },
    stock: { type: Number, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const Product = model<IProduct>("Product", ProductSchema);
