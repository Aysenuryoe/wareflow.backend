import dotenv from "dotenv";
import { Product } from "../../src/models/ProductModel";
import app from "../../src/app";
import supertest from "supertest";
import DB from "tests/DB";
import { createUser } from "../../src/services/UserService";
import { sign } from "jsonwebtoken";
import mongoose, { mongo } from "mongoose";
import { createProduct } from "../../src/services/ProductService";
import {
  ProductResource,
  PurchaseOrderResource,
  SalesOrderResource,
} from "../../src/Resources";
import { createPurchaseOrder } from "../../src/services/PurchaseOrderService";
import productRouter from "src/routes/product";
import { createSalesOrder } from "../../src/services/SalesOrderService";

dotenv.config();

let userId: string;
let jwtToken: string;
const request = supertest(app);
const NON_EXISTING_ID = new mongoose.Types.ObjectId().toString();
const productResource: ProductResource = {
  article: "dress",
  size: "S",
  price: 5,
  barcode: "123456",
  stock: 4,
  productNum: "1234567890",
};

const salesResource: SalesOrderResource = {
  products: [
    {
      barcode: "123456",
      quantity: 2,
      price: 0,
    },
  ],
 
  saleDate: new Date(),
  source: "store",
};
beforeAll(async () => await DB.connect());
beforeEach(async () => {
  const user = await createUser({
    email: "aysenurylr@gmail.com",
    password: "helloaysenur123",
    admin: true,
  });

  userId = user.id!.toString();

  const secret = process.env.JWT_SECRET;

  const payload = { sub: userId, role: "a" };
  jwtToken = sign(payload, secret!, {
    expiresIn: 300,
    algorithm: "HS256",
  });
});
afterEach(async () => await DB.clear());
afterAll(async () => await DB.close());

test("GET /api/sales/all returns all sales orders", async () => {
  const product = await createProduct({
    article: "Sample Product",
    size: "M",
    barcode: "123456",
    price: 20,
    productNum: "1234567890",
    stock: 50,
    description: "Sample description for product",
  });

  await createSalesOrder(salesResource);

  const response = await request
    .get("/api/sales/all")
    .set("Authorization", `Bearer ${jwtToken}`);

  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
  expect(response.body.length).toBeGreaterThan(0);
});

test("GET /api/sales/:id returns a sales order with a valid ID", async () => {
  const product = await createProduct(productResource);

  const newSalesOrder = await createSalesOrder(salesResource);

  const response = await request
    .get(`/api/sales/${newSalesOrder.id}`)
    .set("Authorization", `Bearer ${jwtToken}`);

  expect(response.status).toBe(200);
});

test("GET non existing id throws 404", async () => {
  const response = await request
    .get(`/api/sales/${NON_EXISTING_ID}`)
    .set("Authorization", `Bearer ${jwtToken}`);
  expect(response.statusCode).toBe(404);
});

test("GET invalid id throws 400", async () => {
  const response = await request
    .get(`/api/sales/invalidId`)
    .set("Authorization", `Bearer ${jwtToken}`);
  expect(response.statusCode).toBe(400);
});

test("POST /api/sales/ creates a new sales order with valid data", async () => {
    const product = await createProduct({
      article: "Sample Product",
      size: "M",
      barcode: "123456",
      price: 20,
      productNum: "1234567890",
      stock: 50,
      description: "Sample description for product",
    });
  
    const validSalesData: SalesOrderResource = {
      products: [
        {
          barcode: product.barcode,
          price: 20 ,  
          quantity: 2,  
                  
        }
      ],
              
      saleDate: new Date(),
      source: "store",             
    };
  
    const response = await request
      .post("/api/sales/")
      .set("Authorization", `Bearer ${jwtToken}`)
      .send(validSalesData);
    expect(response.status).toBe(201);
   
  });
  
  
  test("POST /api/sales/ returns 400 if products array is empty", async () => {
    const invalidSalesData = {
      products: [], // Leeres Array
   
      saleDate: new Date(),
      source: "store",
    };
  
    const response = await request
      .post("/api/sales/")
      .set("Authorization", `Bearer ${jwtToken}`)
      .send(invalidSalesData);
  
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Products must be a non-empty array.",
        }),
      ])
    );
  });
  
  test("POST /api/sales/ returns 400 if any product has an invalid or missing barcode", async () => {
    const invalidSalesData = {
      products: [
        { quantity: 2 }, 
        { barcode: 123456, quantity: 2 }, // `barcode` ist keine Zeichenkette
      ],
    
      saleDate: new Date(),
      source: "store",
    };
  
    const response = await request
      .post("/api/sales/")
      .set("Authorization", `Bearer ${jwtToken}`)
      .send(invalidSalesData);
  
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Each product must have a valid barcode.",
        }),
      ])
    );
  });
  
  test("POST /api/sales/ returns 400 if any product has an invalid quantity", async () => {
    const invalidSalesData = {
      products: [
        { barcode: "123456", quantity: 0 }, // `quantity` kleiner als 1
        { barcode: "789012", quantity: 1.5 }, // `quantity` ist keine Ganzzahl
      ],
      
      saleDate: new Date(),
      source: "store",
    };
  
    const response = await request
      .post("/api/sales/")
      .set("Authorization", `Bearer ${jwtToken}`)
      .send(invalidSalesData);
  
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Each product must have a valid quantity greater than 0.",
        }),
      ])
    );
  });
  test("POST /api/sales/ returns 404 if createSalesOrder fails", async () => {
    const invalidSalesData = {
      products: [
        {
          barcode: "INVALID_BARCODE",  
          quantity: 2,
        },
      ],
  
      saleDate: new Date().toISOString(),
      source: "store",
    };
  
    const response = await request
      .post("/api/sales/")
      .set("Authorization", `Bearer ${jwtToken}`)
      .send(invalidSalesData);
  
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "One or more products do not exist."); // Überprüfe die Fehlermeldung
  });
  
  test("PUT /api/sales/:id updates a sales order with valid data", async () => {
    const product = await createProduct(productResource);
  
    const initialSalesData: SalesOrderResource = {
      products: [{
          barcode: product.barcode, 
          quantity: 2,
          price: 20
      }],
      
      saleDate: new Date(),
      source: "store",
    };
  
    const newSalesOrder = await createSalesOrder(initialSalesData);
  
    const updatedSalesData = {
      products: [{ barcode: product.barcode, quantity: 3 }],
     
      saleDate: new Date(),
      source: "store",
    };
  
    const response = await request
      .put(`/api/sales/${newSalesOrder.id}`)
      .set("Authorization", `Bearer ${jwtToken}`)
      .send(updatedSalesData);
  

    expect(response.status).toBe(200);
   
  });
  
  // 1. Test: Fehlender `barcode`
test("PUT /api/sales/:id returns 400 if any product is missing a barcode", async () => {
    const product = await createProduct({
      article: "Sample Product",
      size: "M",
      barcode: "123456",
      price: 20,
      productNum: "1234567890",
      stock: 50,
      description: "Sample description for product",
    });
  
    const newSalesOrder = await createSalesOrder({
      products: [{
          barcode: product.barcode, quantity: 2,
          price: 4
      }],
     
      saleDate: new Date(),
      source: "store",
    });
  
    const invalidUpdateData = {
      products: [
        { quantity: 2 }, // `barcode` fehlt
      ],
     
      saleDate: new Date(),
      source: "store",
    };
  
    const response = await request
      .put(`/api/sales/${newSalesOrder.id}`)
      .set("Authorization", `Bearer ${jwtToken}`)
      .send(invalidUpdateData);
  
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Each product must have a valid barcode.",
        }),
      ])
    );
  });
  
  test("PUT /api/sales/:id returns 400 if any product has an invalid barcode", async () => {
    const product = await createProduct({
      article: "Sample Product",
      size: "M",
      barcode: "123456",
      price: 20,
      productNum: "1234567890",
      stock: 50,
      description: "Sample description for product",
    });
  
    const newSalesOrder = await createSalesOrder({
      products: [{
          barcode: product.barcode,
          quantity: 2,
          price: 1
      }],
     
      saleDate: new Date(),
      source: "store",
    });
  
    const invalidUpdateData = {
      products: [
        { barcode: 123456, quantity: 2 }, // `barcode` ist keine Zeichenkette
      ],
  
      saleDate: new Date(),
      source: "store",
    };
  
    const response = await request
      .put(`/api/sales/${newSalesOrder.id}`)
      .set("Authorization", `Bearer ${jwtToken}`)
      .send(invalidUpdateData);
  
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Each product must have a valid barcode.", // Achte darauf, dass diese Nachricht übereinstimmt
        }),
      ])
    );
  });
  
  test("PUT /api/sales/:id returns 400 if any product has an invalid quantity", async () => {
    const product = await createProduct({
      article: "Sample Product",
      size: "M",
      barcode: "123456",
      price: 20,
      productNum: "1234567890",
      stock: 50,
      description: "Sample description for product",
    });
  
    const newSalesOrder = await createSalesOrder({
      products: [{
          barcode: product.barcode, quantity: 2,
          price: 2
      }],
    
      saleDate: new Date(),
      source: "store",
    });
  
    const invalidUpdateData = {
      products: [
        { barcode: product.barcode, quantity: 0 }, 
        { barcode: product.barcode, quantity: 1.5 }, 
      ],
      
      saleDate: new Date(),
      source: "store",
    };
  
    const response = await request
      .put(`/api/sales/${newSalesOrder.id}`)
      .set("Authorization", `Bearer ${jwtToken}`)
      .send(invalidUpdateData);
  
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Each product must have a valid quantity greater than 0.",
        }),
      ])
    );
  });
  test("PUT /api/sales/:id returns 404 if sales order does not exist", async () => {
    const invalidId = NON_EXISTING_ID; 
  
    const updateData = {
      products: [
        {
          barcode: "123456",
          quantity: 2,
        },
      ],
      
      saleDate: new Date().toISOString(),
      source: "store",
    };
  
    const response = await request
      .put(`/api/sales/${invalidId}`)
      .set("Authorization", `Bearer ${jwtToken}`)
      .send(updateData);
      expect(response.status).toBe(404);
  });
  
  test("DELETE /api/sales/:id deletes a sales order with valid ID", async () => {
    const product = await createProduct({
      article: "Sample Product",
      size: "M",
      barcode: "123456",
      price: 20,
      productNum: "1234567890",
      stock: 50,
      description: "Sample description for product",
    });
      const salesOrderData: SalesOrderResource = {
      products: [
        {
            barcode: product.barcode,
            quantity: 2,
            price: 5
        },
      ],
     
      saleDate: new Date(),
      source: "store",
    };
  
    const newSalesOrder = await createSalesOrder(salesOrderData);
  
    const response = await request
      .delete(`/api/sales/${newSalesOrder.id}`)
      .set("Authorization", `Bearer ${jwtToken}`);
  
    expect(response.status).toBe(204);
  
    const checkResponse = await request
      .get(`/api/sales/${newSalesOrder.id}`)
      .set("Authorization", `Bearer ${jwtToken}`);
      
    expect(checkResponse.status).toBe(404);
  });
  
  test("DELETE non existing id", async() => {
    const response = await request
      .delete(`/api/sales/${NON_EXISTING_ID}`)
      .set("Authorization", `Bearer ${jwtToken}`);
  expect(response.statusCode).toBe(404);
  })
  test("DELETE invalid id", async() => {
    const response = await request
      .delete(`/api/sales/invalidID`)
      .set("Authorization", `Bearer ${jwtToken}`);
  expect(response.statusCode).toBe(400);
  })