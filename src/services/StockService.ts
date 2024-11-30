import { Product } from "../models/ProductModel";

export async function updateStockBySKU(sku: string, quantity: number) {
  const product = await Product.findOne({ sku: sku });
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
    id: product._id.toString(),
    sku: product.sku,
    stock: product.stock,
  };
}
