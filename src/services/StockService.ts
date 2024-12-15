import { Product } from "../models/ProductModel";

export async function updateStock(id: string, quantity: number) {
  const product = await Product.findById(id);
  if (!product) {
    throw new Error("Product not found.");
  }

  const newStock = product.stock + quantity;

  if (newStock < 0) {
    throw new Error("Insufficient stock to complete this operation.");
  }

  product.stock = newStock;
  await product.save();

  return {
    id: product.id.toString(),
    name: product.name,
    stock: product.stock,
  };
}
