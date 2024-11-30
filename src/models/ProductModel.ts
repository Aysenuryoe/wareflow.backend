import { model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";


export interface IProduct {
  name: string;
  size: string;
  price: number;
  color: string,
  sku: string,
  stock: number;
  minStock: number;
  description?: string;
}

export const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true},
  size: { type: String, enum: [ 
    "XS", "S", "M", "L", "XL",        
    "36", "37", "38", "39", "40",     
    "41", "42", "43", "44", "NOSIZE"      
  ]} ,
  price: {type: Number, required: true},
  color: [{ type: String}],
  sku: {type: String, unique: true},
  stock: { type: Number, required: true},
  minStock: { type: Number, required: true, default: 3 },
  description: { type: String}
});

ProductSchema.pre("save", function (next) {
  if (!this.sku) {
    this.sku = uuidv4().split("-")[0];
  }
  next();
});


export const Product = model<IProduct>("Product", ProductSchema);
