import DB from "tests/DB";
import { Product } from "../../src/models/ProductModel";
import { SalesOrder } from "../../src/models/SalesOrderModel";

beforeAll(async () => await DB.connect());
afterEach(async () => await DB.clear());
afterAll(async () => await DB.close());

test("successful saving of sales order", async () => {
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

  const salesOrder = new SalesOrder({
    products: [
      {
        barcode: product.barcode,
        price: product.price,
        quantity: 2,
      },
    ],
   
    saleDate: new Date(),
    source: "store",
  });

  const res = await salesOrder.save();
 
  expect(res.products.length).toBe(1);
  expect(res.products[0].barcode).toBe(product.barcode);
});





test("should throw error when saleDate is missing", async () => {
  const salesOrder = new SalesOrder({
    products: [
      {
        barcode: "001938",
        price: 24.99,
        quantity: 2,
      },
    ],

    source: "store",
  });

  await expect(salesOrder.save()).rejects.toThrowError();
});

test("should throw error when barcode is missing", async () => {
  const salesOrder = new SalesOrder({
    products: [
      {
        price: 24.99,
        quantity: 2,
      },
    ],

    saleDate: new Date(),
    source: "store",
  });

  await expect(salesOrder.save()).rejects.toThrowError();
});

test("should throw error when quantity is invalid", async () => {
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

  const salesOrder = new SalesOrder({
    products: [
      {
        barcode: product.barcode,
        price: product.price,
        quantity: 0,
      },
    ],
 
    saleDate: new Date(),
    source: "store",
  });

  await expect(salesOrder.save()).rejects.toThrowError();
});

