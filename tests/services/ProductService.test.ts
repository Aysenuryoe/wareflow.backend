import DB from "tests/DB";
import { Product } from "../../src/models/ProductModel";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from "../../src/services/ProductService";
import { Types } from "mongoose";


beforeAll(async () => await DB.connect());
afterEach(async () => await DB.clear());
afterAll(async () => await DB.close());

test("successful saving of product", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
    description: "Blue jeans",
  });

  const res = await product.save();
  expect(res.article).toBe(product.article);
  expect(res.barcode).toBe(product.barcode);
  expect(res.productNum).toBe(product.productNum);
  expect(res.price).toBe(product.price);
});

test("successful get all products", async () => {
  const product1 = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
    description: "Blue jeans",
  });
  const product2 = new Product({
    article: "Shirt",
    size: "L",
    barcode: "001939",
    productNum: "1233874660",
    price: 19.99,
    stock: 5,
    description: "White shirt",
  });

  await product1.save();
  await product2.save();

  const products = await getAllProducts();
  expect(products.length).toBe(2);
  expect(products[0].article).toBe(product1.article);
  expect(products[1].article).toBe(product2.article);
});

test("GET a product by id", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
    description: "Blue jeans",
  });

  await product.save();

  const retrievedProduct = await getProduct(product.id);
  expect(retrievedProduct.id).toBe(product.id);
  expect(retrievedProduct.article).toBe(product.article);
});

test("should throw error when product not found", async () => {
  const nonExistingID = "67226a8f219b6849df38a957";
  await expect(getProduct(nonExistingID)).rejects.toThrowError("Product not found.");
});


test("successful update of product", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
    description: "Blue jeans",
  });

  await product.save();

  const updatedProduct = await updateProduct({
    id: product.id,
    article: "Updated Jeans",
    size: "L",
    barcode: product.barcode,
    price: 29.99,
    productNum: product.productNum,
    stock: 15,
  });

  expect(updatedProduct.article).toBe("Updated Jeans");
  expect(updatedProduct.price).toBe(29.99);
});

test("successful creation of product", async () => {
  const productResource = {
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
  };

  const createdProduct = await createProduct(productResource);
  expect(createdProduct.article).toBe(productResource.article);
  expect(createdProduct.size).toBe(productResource.size);
  expect(createdProduct.barcode).toBe(productResource.barcode);
  expect(createdProduct.productNum).toBe(productResource.productNum);
  expect(createdProduct.price).toBe(productResource.price);
  expect(createdProduct.stock).toBe(productResource.stock);
});


test("should throw error when barcode already exists", async () => {
  const productResource1 = {
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
  };

  const productResource2 = {
    article: "Shirt",
    size: "L",
    barcode: "001938", 
    productNum: "1233874660",
    price: 19.99,
    stock: 5,
  };

  await createProduct(productResource1);

  await expect(createProduct(productResource2)).rejects.toThrow("A product with the same barcode already exists.");
});


test("should throw error when product not found during update", async () => {
  const invalidId = "67226a8f219b6849df38a957"; 

  const productResource = {
    id: invalidId,
    article: "Updated Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 15,
  };

  await expect(updateProduct(productResource)).rejects.toThrow("Product not found.");
});

test("should throw error when updating non-existent product", async () => {
  await expect(updateProduct({
    id: "invalidId", article: "New Product",
    barcode: "",
    size: "",
    price: 0,
    productNum: "",
    stock: 0
  })).rejects.toThrowError();
});

test("successful deletion of product", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
    description: "Blue jeans",
  });

  await product.save();
  await deleteProduct(product.id);

  await expect(Product.findById(product.id)).resolves.toBeNull();
});

test("should throw error when deleting non-existent product", async () => {
  await expect(deleteProduct("invalidId")).rejects.toThrowError();
});

test("should throw error when deleting a product that does not exist", async () => {
  const invalidId = "67226a8f219b6849df38a957";
  await expect(deleteProduct(invalidId)).rejects.toThrow("Product not found.");
});