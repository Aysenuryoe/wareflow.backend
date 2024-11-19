import DB from "tests/DB";
import { Product } from "../../src/models/ProductModel";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from "../../src/services/ProductService";
import mongoose, { Types } from "mongoose";
import { decreaseStock, increaseStock } from "../../src/services/StockService";


beforeAll(async () => await DB.connect());
afterEach(async () => await DB.clear());
afterAll(async () => await DB.close());

test("successfully increasing the stock", async () => {
    const product = await createProduct({
        article: "Test Product",
        size: "M",
        barcode: "123456",
        price: 20.0,
        productNum: "1234567890",
        stock: 10,
    });
    if (!product.id) {
        throw new Error("Product ID is undefined");
    }
    const result = await increaseStock(product.id, 5);
    expect(result.stock).toBe(15);
}); 


test("increaseStock throws an error if product is not found", async () => {
    const unknownId = new mongoose.Types.ObjectId().toString();
    await expect(increaseStock(unknownId, 5)).rejects.toThrow("Product not found");
});

test("successfully increasing the stock", async () => {
    const product = await createProduct({
        article: "Test Product",
        size: "M",
        barcode: "123456",
        price: 20.0,
        productNum: "1234567890",
        stock: 10,
    });
    if (!product.id) {
        throw new Error("Product ID is undefined");
    }
    const result = await decreaseStock(product.id, 5);
    expect(result.stock).toBe(5);
}); 

test("successfully increasing the stock", async () => {
    const product = await createProduct({
        article: "Test Product",
        size: "M",
        barcode: "123456",
        price: 20.0,
        productNum: "1234567890",
        stock: 10,
    });
    if (!product.id) {
        throw new Error("Product ID is undefined");
    }
    await expect(decreaseStock(product.id, 15)).rejects.toThrowError("Insufficient stock to decrease.");
}); 

test("decreaseStock throws an error if product is not found", async () => {
    const unknownId = new mongoose.Types.ObjectId().toString();
    await expect(decreaseStock(unknownId, 5)).rejects.toThrow("Product not found.");
});