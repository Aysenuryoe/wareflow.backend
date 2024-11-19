import DB from "tests/DB";
import { Product } from "../../src/models/ProductModel";
import { PurchaseOrder } from "../../src/models/PurchaseOrderModel";
import { createPurchaseOrder, getAllPurchaseOrders, getPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } from "../../src/services/PurchaseOrderService"; 
import { PurchaseOrderResource } from "../../src/Resources";

beforeAll(async () => await DB.connect());
afterEach(async () => await DB.clear());
afterAll(async () => await DB.close());

test("successful creation of purchase order", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
  });

  await product.save();

  const purchaseOrderResource: PurchaseOrderResource = {
    products: [
      {
        barcode: product.barcode,
        quantity: 2,
      },
    ],
   
    orderDate: new Date(),
    status: "Ordered", 
  };

  const createdOrder = await createPurchaseOrder(purchaseOrderResource);
  
  expect(createdOrder.products.length).toBe(1);
  expect(createdOrder.products[0].barcode).toBe(product.barcode);
});


test("should throw error when product does not exist", async () => {
  const purchaseOrderResource: PurchaseOrderResource = {
    products: [
      {
        barcode: "001999",
        quantity: 2,
      },
    ],
   
    orderDate: new Date(),
    status: "Ordered",
  };

  await expect(createPurchaseOrder(purchaseOrderResource)).rejects.toThrow("One or more products do not exist.");
});

test("should get all purchase orders", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
  });

  await product.save();

  const purchaseOrderResource: PurchaseOrderResource = {
    products: [
      {
        barcode: product.barcode,
        quantity: 2,
      },
    ],
  
    orderDate: new Date(),
    status: "Ordered",
  };

  await createPurchaseOrder(purchaseOrderResource);

  const purchaseOrders = await getAllPurchaseOrders();
  expect(purchaseOrders.length).toBe(1);
  
});



test("should throw error when purchase order not found", async () => {
  const invalidId = "67226a8f219b6849df38a957"; 

  await expect(getPurchaseOrder(invalidId)).rejects.toThrow("Purchase order not found.");
});



test("should throw error when updating a non-existing purchase order", async () => {
  const invalidId = "67226a8f219b6849df38a957"; 

  const updateResource: PurchaseOrderResource = {
    id: invalidId,
    products: [
      {
        barcode: "001938",
        quantity: 2,
      },
    ],

    orderDate: new Date(),
    status: "Ordered",
  };

  await expect(updatePurchaseOrder(updateResource)).rejects.toThrow("Purchase order not found.");
});



test("should throw error when deleting a non-existing purchase order", async () => {
  const invalidId = "67226a8f219b6849df38a957";

  await expect(deletePurchaseOrder(invalidId)).rejects.toThrow("Purchase order not found.");
});

test("GET successful purchase", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
  });

  await product.save();

  const purchaseOrder = new PurchaseOrder({
    products: [
      {
        barcode: product.barcode,
        quantity: 2,
      },
    ],
   
    orderDate: new Date(),
    status: "Ordered",
  });

  await purchaseOrder.save();

  const fetchedOrder: PurchaseOrderResource = await getPurchaseOrder(purchaseOrder.id);

  expect(fetchedOrder.id).toBe(purchaseOrder.id);
  expect(fetchedOrder.products.length).toBe(1);
  expect(fetchedOrder.products[0].barcode).toBe(product.barcode);
  expect(fetchedOrder.products[0].quantity).toBe(2);

  expect(fetchedOrder.status).toBe("Ordered");
  expect(fetchedOrder.orderDate).toBeTruthy(); 
  expect(fetchedOrder.receivedDate).toBeUndefined();
});

test("should throw error when purchase order not found", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
  });

  await product.save();

  const purchaseOrderResource: PurchaseOrderResource = {
    id: "67226a8f219b6849df38a957", 
    products: [
      {
        barcode: product.barcode,
        quantity: 2,
      },
    ],
  
    orderDate: new Date(),
    status: "Ordered",
  };

  await expect(updatePurchaseOrder(purchaseOrderResource)).rejects.toThrow("Purchase order not found.");
});

test("should delete purchase order successfully", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
  });

  await product.save();

  const purchaseOrder = new PurchaseOrder({
    products: [
      {
        barcode: product.barcode,
        quantity: 2,
      },
    ],
   
    orderDate: new Date(),
    status: "Ordered",
  });

  await purchaseOrder.save();

  await deletePurchaseOrder(purchaseOrder.id);

  const deletedOrder = await PurchaseOrder.findById(purchaseOrder.id);
  expect(deletedOrder).toBeNull();
});