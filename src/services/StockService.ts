import { Product } from "../models/ProductModel";

export async function increaseStock(barcode: string, quantity: number) {
  const product = await Product.findOne({ barcode: barcode });
  if (!product) {
    throw new Error("Product not found.");
  }
  product.stock += quantity;
  await product.save();
  return product;
}

export async function decreaseStock(barcode: string, quantity: number) {
  const product = await Product.findOne({ barcode: barcode });
  if (!product) {
    throw new Error("Product not found.");
  }
  if (product.stock < quantity) {
    throw new Error("Insufficient stock to decrease.");
  }
  product.stock -= quantity;
  await product.save();
  return product;
}
