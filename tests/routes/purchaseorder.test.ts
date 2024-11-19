import dotenv from "dotenv";
import { Product } from "../../src/models/ProductModel";
import app from "../../src/app";
import supertest from "supertest";
import DB from "tests/DB";
import { createUser } from "../../src/services/UserService";
import { sign } from "jsonwebtoken";
import mongoose, { mongo } from "mongoose";
import { createProduct } from "../../src/services/ProductService";
import { ProductResource, PurchaseOrderResource } from "../../src/Resources";
import { createPurchaseOrder } from "../../src/services/PurchaseOrderService";
import productRouter from "src/routes/product";

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
    productNum: "1234567890"
}

const purchaseResource: PurchaseOrderResource = {
    products: [{
      barcode: "123456",
      quantity: 2
    }],
   
    status: "Ordered",
    orderDate: new Date()
}
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

test("GET /api/purchase/all returns all purchase orders", async () => {

    const newProduct = await createProduct(productResource)
    const newPurchaseOrder = await createPurchaseOrder(purchaseResource);
    const response = await request
      .get("/api/purchase/all")
      .set("Authorization", `Bearer ${jwtToken}`);
  
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });
  
  test("GET purchase by id", async () => {
    const newProduct = await createProduct(productResource)
    const newPurchaseOrder = await createPurchaseOrder(purchaseResource);
    const response = await request
      .get(`/api/purchase/${newPurchaseOrder.id}`)
      .set("Authorization", `Bearer ${jwtToken}`);
  expect(response.statusCode).toBe(200);
  expect(response.body.status).toBe(newPurchaseOrder.status);
  });
  
  test("GET error by non existing id", async() => {
    await createProduct(productResource);
    await createPurchaseOrder(purchaseResource);
    const response = await request
      .get(`/api/purchase/${NON_EXISTING_ID}`)
      .set("Authorization", `Bearer ${jwtToken}`);
      expect(response.statusCode).toBe(404);
  })
  test("GET error by invalid id", async() => {
    await createProduct(productResource);
    await createPurchaseOrder(purchaseResource);
    const response = await request
      .get(`/api/purchase/invalidID`)
      .set("Authorization", `Bearer ${jwtToken}`);
      expect(response.statusCode).toBe(400);
  });

  test("POST successfull",async() =>{
    await createProduct(productResource);
    const newPurchase = await createPurchaseOrder(purchaseResource);
    const response = await request
    .post("/api/purchase/")
    .set("Authorization", `Bearer ${jwtToken}`)
    .send(newPurchase);

  expect(response.status).toBe(201);
  expect(response.body).toMatchObject({
   
    status: newPurchase.status,
    products: newPurchase.products.map((product) => ({
      barcode: product.barcode,
      quantity: product.quantity,
    })),
  });

  });

  // 1. Test: Leeres `products`-Array
test("POST /api/purchase/ returns 400 if products array is empty", async () => {
    const invalidPurchaseData = {
      products: [], // Leeres Array

      orderDate: "2023-10-10",
      status: "Ordered",
    };
  
    const response = await request
      .post("/api/purchase/")
      .set("Authorization", `Bearer ${jwtToken}`)
      .send(invalidPurchaseData);
  
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Products must be a non-empty array.",
        }),
      ])
    );
  });
  
  // 2. Test: Ungültige oder fehlende `barcode`-Werte
  test("POST /api/purchase/ returns 400 if any product has an invalid or missing barcode", async () => {
    const invalidPurchaseData = {
      products: [
        { quantity: 2 }, // `barcode` fehlt
        { barcode: 123456, quantity: 2 }, // `barcode` ist keine Zeichenkette
      ],
     
      orderDate: "2023-10-10",
      status: "Ordered",
    };
  
    const response = await request
      .post("/api/purchase/")
      .set("Authorization", `Bearer ${jwtToken}`)
      .send(invalidPurchaseData);
  
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Each product must have a unique barcode.",
        }),
      ])
    );
  });
  
  test("POST /api/purchase/ returns 400 if any product has an invalid quantity", async () => {
    const invalidPurchaseData = {
      products: [
        { barcode: "123456", quantity: 0 }, // quantity kleiner als 1
        { barcode: "789012", quantity: 1.5 }, // quantity ist keine Ganzzahl
      ],
      orderDate: "2023-10-10",
      status: "Ordered",
    };
  
    const response = await request
      .post("/api/purchase/")
      .set("Authorization", `Bearer ${jwtToken}`)
      .send(invalidPurchaseData);
  
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Each product must have a valid quantity greater than 0.",
        }),
      ])
    );
  });
  
  test("POST /api/purchase/ triggers catch block and returns 404 when product barcode is invalid", async () => {
    const invalidPurchaseData = {
      products: [{ barcode: "nonexistent123", quantity: 2 }], // ungültiger Barcode
    
      orderDate: "2023-10-10",
      status: "Ordered",
    };
  
    const response = await request
      .post("/api/purchase/")
      .set("Authorization", `Bearer ${jwtToken}`)
      .send(invalidPurchaseData);
  
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBeDefined();
  });
  
  test("PUT positiv", async() => {
    const product = await createProduct(productResource);
    const newPurchaseOrder = await createPurchaseOrder(purchaseResource);

    const updatedPurchaseData = {
        products: [{ barcode: product.barcode, quantity: 3 }],
        
        orderDate: new Date(),
        status: "Pending",
      };
    
      const response = await request
        .put(`/api/purchase/${newPurchaseOrder.id}`)
        .set("Authorization", `Bearer ${jwtToken}`)
        .send(updatedPurchaseData);
    
      expect(response.status).toBe(200);

  });

  test("PUT invalid id throws error", async() => {
    const response = await request
        .put(`/api/purchase/${NON_EXISTING_ID}`)
        .set("Authorization", `Bearer ${jwtToken}`);
        
    
      expect(response.status).toBe(400);
  });

  test("PUT /api/purchase/:id returns 400 if products array is empty", async () => {
    const product = await createProduct(productResource);
  
    const newPurchaseOrder = await createPurchaseOrder({
      products: [{ barcode: product.barcode, quantity: 2 }],
    
      orderDate: new Date(),
      status: "Ordered",
    });
  
    const invalidUpdateData = {
      products: [], 
     
      orderDate: new Date(),
      status: "Ordered",
    };
  
    const response = await request
      .put(`/api/purchase/${newPurchaseOrder.id}`)
      .set("Authorization", `Bearer ${jwtToken}`)
      .send(invalidUpdateData);
  
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Products must be a non-empty array.",
        }),
      ])
    );
  });
  
  
  test("PUT /api/purchase/:id returns 400 if any product has an invalid or missing barcode", async () => {
    const product = await createProduct(productResource);
  
    const newPurchaseOrder = await createPurchaseOrder(purchaseResource);
  
    const invalidUpdateData = {
      products: [
        { quantity: 2 }, 
        { barcode: 123456, quantity: 2 }, 
      ],
  
      orderDate: "2023-10-10",
      status: "Ordered",
    };
  
    const response = await request
      .put(`/api/purchase/${newPurchaseOrder.id}`)
      .set("Authorization", `Bearer ${jwtToken}`)
      .send(invalidUpdateData);
  
    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Each product must have a unique barcode.",
        }),
      ])
    );
  });
  
  
  test("PUT /api/purchase/:id returns 400 if any product has an invalid quantity", async () => {
    const product1 = await createProduct({
      article: "Product 1",
      size: "M",
      barcode: "123456",
      price: 20,
      productNum: "1234567890",
      stock: 50,
      description: "Sample description for Product 1",
    });
  
    const product2 = await createProduct({
      article: "Product 2",
      size: "L",
      barcode: "789012",
      price: 30,
      productNum: "0987654321",
      stock: 30,
      description: "Sample description for Product 2",
    });
  
    const newPurchaseOrder = await createPurchaseOrder({
      products: [{ barcode: product1.barcode, quantity: 2 }],
      
      orderDate: new Date(),
      status: "Ordered",
    });
  
    const invalidUpdateData = {
      products: [
        { barcode: product1.barcode, quantity: 0 }, // `quantity` kleiner als 1
        { barcode: product2.barcode, quantity: 1.5 }, // `quantity` ist keine Ganzzahl
      ],

      orderDate: "2023-10-10",
      status: "Ordered",
    };
  
    const response = await request
      .put(`/api/purchase/${newPurchaseOrder.id}`)
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
  
  test("PUT /api/purchase/:id returns 404 for non-existing id", async () => {
    const product = await createProduct(productResource);
  
    const newPurchaseOrder = {
      products: [{ barcode: product.barcode, quantity: 2 }],
      
      orderDate: new Date(),
      status: "Ordered",
    };
  
    const response = await request
      .put(`/api/purchase/${NON_EXISTING_ID}`)
      .set("Authorization", `Bearer ${jwtToken}`)
      .send(newPurchaseOrder);
  
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBeDefined();
  });

  test("DELETE /api/purchase/:id successfully deletes a purchase order", async () => {
    const product = await createProduct({
      article: "Sample Article",
      size: "M",
      barcode: "123456",
      price: 20,
      productNum: "1234567890",
      stock: 50,
      description: "Sample description for product",
    });
  
    const newPurchaseOrder = await createPurchaseOrder({
      products: [{ barcode: product.barcode, quantity: 2 }],
    
      orderDate: new Date(),
      status: "Ordered",
    });
  
    const response = await request
      .delete(`/api/purchase/${newPurchaseOrder.id}`)
      .set("Authorization", `Bearer ${jwtToken}`);
  
    expect(response.status).toBe(204);
      const checkResponse = await request
      .get(`/api/purchase/${newPurchaseOrder.id}`)
      .set("Authorization", `Bearer ${jwtToken}`);
  
    expect(checkResponse.status).toBe(404);
  });
  
  test("DELETE non existing id thrwos 404", async() => {
    const response = await request
      .delete(`/api/purchase/${NON_EXISTING_ID}`)
      .set("Authorization", `Bearer ${jwtToken}`);
      expect(response.statusCode).toBe(404);
  })

  test("DELETE invalid id thrwos 400", async() => {
    const response = await request
      .delete(`/api/purchase/invalidID`)
      .set("Authorization", `Bearer ${jwtToken}`);
      expect(response.statusCode).toBe(400);
  })