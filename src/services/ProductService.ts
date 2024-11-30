import { Product } from "../../src/models/ProductModel";
import { ProductResource } from "src/Resources";

export async function getAllProducts(): Promise<ProductResource[]> {
  let products = await Product.find().exec();

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      size: product.size,
      price: product.price,
      color: product.color,
      sku: product.sku,
      stock: product.stock,
      minStock: product.minStock,
      description: product.description,
    }));
  
}

export async function getProduct(id: string): Promise<ProductResource> {
  let product = await Product.findById(id);
  if (!product) {
    throw new Error("Product not found.");
  } else {
    return {
      id: product.id,
      name: product.name,
      size: product.size,
      price: product.price,
      color: product.color,
      sku: product.sku,
      stock: product.stock,
      minStock: product.minStock,
      description: product.description,
    };
  }
}

export async function createProduct(
  productResource: ProductResource
): Promise<ProductResource> {
  let newProduct = await Product.create({
    name: productResource.name,
    size: productResource.size,
    price: productResource.price,
    color: productResource.color,
    sku: productResource.sku,
    stock: productResource.stock,
    minStock: productResource.minStock,
    description: productResource.description,
  });
  return {
    id: newProduct.id,
    name: newProduct.name,
    size: newProduct.size,
    price: newProduct.price,
    color: newProduct.color,
    sku: newProduct.sku,
    stock: newProduct.stock,
    minStock: newProduct.minStock,
    description: newProduct.description,
  };
};

export async function updateProduct(productResource: ProductResource):Promise<ProductResource> {
  let product = await Product.findById(productResource.id);
  if (!product) {
    throw new Error("Product not found.");
  } else{
    const updateObject: {
      name?: string;
      size?: string;
      price?: number;
      color?: string,
      minStock?: number;
      description?: string;
    } = {};

    if (productResource.name) {
      updateObject.name = productResource.name;
    }
    if (productResource.size) {
      updateObject.size = productResource.size;
    }
    if (productResource.price) {
      updateObject.price = productResource.price;
    }
    if (productResource.color) {
      updateObject.color = productResource.color;
    }
    if (productResource.minStock) {
      updateObject.minStock = productResource.minStock;
    }
    if (productResource.description) {
      updateObject.description = productResource.description;
    }

    await Product.updateOne({
      _id: productResource.id
    }, updateObject);
    product = await Product.findById(productResource.id);

    return{
      name: product!.name,
      size: product!.size,
      price: product!.price,
      color: product!.color,
      sku: product!.sku,
      stock: product!.stock,
      minStock: product!.minStock,
      description: product!.description
    }
  }
};

export async function deleteProduct(id: string): Promise<void> {
  let product = await Product.findById(id);
  if (!product) {
    throw new Error("Product not found.");
  } else {
    await Product.deleteOne({_id: id});
  }
}
