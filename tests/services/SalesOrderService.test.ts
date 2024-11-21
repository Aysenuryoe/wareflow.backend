import DB from "tests/DB";
import { Product } from "../../src/models/ProductModel";
import { SalesOrder } from "../../src/models/SalesOrderModel";
import { getAllSalesOrders, getSalesOrder, createSalesOrder, updateSalesOrder, deleteSalesOrder } from "../../src/services/SalesOrderService";
import { SalesOrderResource } from "../../src/Resources";
import mongoose from "mongoose";

beforeAll(async () => await DB.connect());
afterEach(async () => await DB.clear());
afterAll(async () => await DB.close());

test("successful retrieval of all sales orders", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
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

  await salesOrder.save();

  const orders = await getAllSalesOrders();
  expect(orders.length).toBe(1);
  
  expect(orders[0].products[0].barcode).toBe(product.barcode);
});

test("successful retrieval of a specific sales order", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
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

  await salesOrder.save();

  const fetchedOrder = await getSalesOrder(salesOrder.id);
  expect(fetchedOrder.id).toBe(salesOrder.id);
 
  expect(fetchedOrder.products[0].barcode).toBe(product.barcode);
});

test("should throw error when sales order not found", async () => {
  await expect(getSalesOrder("635d2e796ea2e8c9bde5787c")).rejects.toThrow("Sales order not found.");
});

test("successful creation of sales order", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
  });

  await product.save();

  const salesOrderResource: SalesOrderResource = {
    products: [
      {
        barcode: product.barcode,
        price: product.price,
        quantity: 2,
      },
    ],
   
    saleDate: new Date(),
    source: "store",
  };

  const createdOrder = await createSalesOrder(salesOrderResource);
  
  expect(createdOrder.products.length).toBe(1);
  expect(createdOrder.products[0].barcode).toBe(product.barcode);
});

test("should throw error when one or more products do not exist", async () => {
  const salesOrderResource: SalesOrderResource = {
    products: [
      {
        barcode: "nonexistentBarcode",
        price: 24.99,
        quantity: 2,
      },
    ],
  
    saleDate: new Date(),
    source: "store",
  };

  await expect(createSalesOrder(salesOrderResource)).rejects.toThrow(/Failed to create sales order/);
});

test("successful update of sales order", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
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

  await salesOrder.save();

  const updatedOrderResource: SalesOrderResource = {
    id: salesOrder.id,
    products: [
      {
        barcode: product.barcode,
        quantity: 3, 
        price: product.price,
      },
    ],
    saleDate: new Date(),
    source: "store",
  };


  const updatedOrder = await updateSalesOrder(updatedOrderResource);

  expect(updatedOrder.products[0].quantity).toBe(3);
});



test("should throw error when sales order not found", async () => {
    await expect(getSalesOrder(new mongoose.Types.ObjectId().toString())).rejects.toThrow("Sales order not found.");
  })

  test("should throw error when sales order not found", async () => {
    const updatedOrderResource: SalesOrderResource = {
      id: "635d2e796ea2e8c9bde5787c", 
      products: [
        {
          barcode: "001938",
          price: 5,
          quantity: 2,
        },
      ],
    
      saleDate: new Date(),
      source: "store"
    };
  
    await expect(updateSalesOrder(updatedOrderResource)).rejects.toThrow("Sales order not found.");
  });

  test("should throw error when sales order not found for delete", async () => {
    await expect(deleteSalesOrder(new mongoose.Types.ObjectId().toString())).rejects.toThrow("Sales order not found.");
  });

  test("should throw error when one or more products do not exist", async () => {
    const product = new Product({
      article: "Jeans",
      size: "M",
      barcode: "001938",
      productNum: "1233874659",
      price: 24.99,
      stock: 10,
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
  
    await salesOrder.save();
  
    const updatedOrderResource: SalesOrderResource = {
      id: salesOrder.id,
      products: [
        {
          barcode: "nonexistentBarcode", 
          price: 20,
          quantity: 3,
        },
      ],
  
      saleDate: new Date(),
      source: "store"
    };
  
    await expect(updateSalesOrder(updatedOrderResource)).rejects.toThrow("One or more products do not exist.");
  });


test("should throw error when updating non-existent sales order", async () => {
  const updatedOrderResource: SalesOrderResource = {
    id: new mongoose.Types.ObjectId().toString(),
    products: [
      {
        barcode: "001938",
        price: 23.99,
        quantity: 2,
      },
    ],
    
    saleDate: new Date(),
    source: "store",
  };

  await expect(updateSalesOrder(updatedOrderResource)).rejects.toThrow("Sales order not found.");
});

test("successful deletion of sales order", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
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

  await salesOrder.save();

  await deleteSalesOrder(salesOrder.id);

  const deletedOrder = await SalesOrder.findById(salesOrder.id);
  expect(deletedOrder).toBeNull();
});

test("should throw error when deleting non-existent sales order", async () => {
  await expect(deleteSalesOrder(new mongoose.Types.ObjectId().toString())).rejects.toThrow("Sales order not found.");
});
