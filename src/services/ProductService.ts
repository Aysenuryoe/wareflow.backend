import { Product } from "../../src/models/ProductModel";
import { ProductResource } from "../../src/Resources";
import { logger } from "../../src/logger";
import { InventoryMovement } from "../../src/models/IventoryMovementModel";
import { PurchaseOrder } from "src/models/PurchaseOrderModel";

export async function getAllProducts(): Promise<ProductResource[]> {
  const products = await Product.find().exec();
  const productResource: ProductResource[] = new Array();
  for (var product of products) {
    var resource: ProductResource = {
      id: product.id,
      article: product.article,
      size: product.size,
      barcode: product.barcode,
      price: product.price,
      productNum: product.productNum,
      stock: product.stock,
    };
    productResource.push(resource);
  }
  return productResource;
}

export async function getProduct(id: string): Promise<ProductResource> {
  const product = await Product.findById(id);

  if (!product) {
    const errorMsg = "Product not found.";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  } else {
    const productResource: ProductResource = {
      id: product._id.toString(),
      article: product.article,
      size: product.size,
      barcode: product.barcode,
      price: product.price,
      productNum: product.productNum,
      stock: product.stock,
    };
    return productResource;
  }
}

export async function createProduct(
  productResource: ProductResource
): Promise<ProductResource> {
  const existingBarcode = await Product.findOne({
    barcode: productResource.barcode,
  });

  if (existingBarcode) {
    const errorMsg = "A product with the same barcode already exists.";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  } else {
    const product = await Product.create({
      article: productResource.article,
      size: productResource.size,
      barcode: productResource.barcode,
      price: productResource.price,
      productNum: productResource.productNum,
      stock: productResource.stock,
    });

    return {
      id: product.id,
      article: product.article,
      size: product.size,
      barcode: product.barcode,
      price: product.price,
      productNum: product.productNum,
      stock: product.stock,
    };
  }
}

export async function updateProduct(
  productResource: ProductResource
): Promise<ProductResource> {
  let product = await Product.findById(productResource.id);
  const updateData: {
    article?: string;
    size?: string;
    price?: number;
    stock?: number;
  } = {};

  if (productResource.article) {
    updateData.article = productResource.article;
  }
  if (productResource.size) {
    updateData.size = productResource.size;
  }
  if (productResource.price) {
    updateData.price = productResource.price;
  }
  if (productResource.stock) {
    updateData.stock = productResource.stock;
  }

  await Product.updateOne({ _id: productResource.id }, updateData);
  let updatedProduct = await Product.findById(productResource.id).exec();

  if (!updatedProduct) {
    const errorMsg = "Product not found.";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  return {
    id: updatedProduct.id,
    article: updatedProduct.article,
    size: updatedProduct.size,
    barcode: updatedProduct.barcode,
    price: updatedProduct.price,
    productNum: updatedProduct.productNum,
    stock: updatedProduct.stock,
  };
}

export async function deleteProduct(id: string): Promise<void> {
  var product = await Product.findById(id);
  if (!product) {
    const errorMsg = "Product not found.";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  } else {
    await Product.deleteOne({ _id: id });
  }
}
