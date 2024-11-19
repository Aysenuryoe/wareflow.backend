import DB from "tests/DB";
import { Product } from "../../src/models/ProductModel";
import { PurchaseOrder } from "../../src/models/PurchaseOrderModel";

beforeAll(async () => await DB.connect());
afterEach(async () => await DB.clear());
afterAll(async () => await DB.close());

test("successful saving of purchase order", async () => {
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

  const purchaseOrder = new PurchaseOrder({
    products: [
      {
        barcode: product.barcode,
        quantity: 2,
      },
    ],
  
    status: "Ordered",
    orderDate: new Date(),
  });

  const res = await purchaseOrder.save();
 
  expect(res.products.length).toBe(1);
  expect(res.products[0].barcode).toBe(product.barcode);
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

  const purchaseOrder = new PurchaseOrder({
    products: [
      {
        barcode: product.barcode,
        quantity: 0,
      },
    ],
   
    status: "Ordered",
    orderDate: new Date(),
  });

  await expect(purchaseOrder.save()).rejects.toThrowError();
});

test("should throw error when status is invalid", async () => {
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

  const purchaseOrder = new PurchaseOrder({
    products: [
      {
        barcode: product.barcode,
        quantity: 2,
      },
    ],

    status: "InvalidStatus",
    orderDate: new Date(),
  });

  await expect(purchaseOrder.save()).rejects.toThrowError();
});
