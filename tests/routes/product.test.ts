import dotenv from "dotenv";
import { Product } from "../../src/models/ProductModel";
import app from "../../src/app";
import supertest from "supertest";
import DB from "tests/DB";
import { createUser } from "../../src/services/UserService";
import { sign } from "jsonwebtoken";
import mongoose from "mongoose";
import { createProduct } from "../../src/services/ProductService";
import { ProductResource } from "../../src/Resources";

dotenv.config();

let userId: string;
let jwtToken: string;

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

const request = supertest(app);

test("get all products", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
  });
  await product.save();

  const response = await request
    .get("/api/product/all")
    .set("Authorization", `Bearer ${jwtToken}`);

  expect(response.status).toBe(200);
  expect(response.body.length).toBe(1);
  expect(response.body[0].article).toBe("Jeans");
});

test("get product by id", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
  });
  await product.save();

  const response = await request
    .get(`/api/product/${product.id}`)
    .set("Authorization", `Bearer ${jwtToken}`);

  expect(response.status).toBe(200);
  expect(response.body.article).toBe("Jeans");
});

test("get product by id - not found", async () => {
  const response = await request
    .get(`/api/product/invalidId`)
    .set("Authorization", `Bearer ${jwtToken}`);

  expect(response.status).toBe(400);
 
});

test("create product", async () => {
  const productData = {
    article: "Shirt",
    size: "L",
    barcode: "001939",
    productNum: "1233874660",
    price: 19.99,
    stock: 5,
  };

  const response = await request
    .post(`/api/product`)
    .set("Authorization", `Bearer ${jwtToken}`)
    .send(productData);

  expect(response.status).toBe(201);
  expect(response.body.article).toBe("Shirt");
  expect(response.body.barcode).toBe("001939");
});

test("create product - validation error", async () => {
  const productData = {
    article: "Shirt",
    size: "L",
    barcode: "00193", 
    productNum: "1233874660",
    price: 19.99,
    stock: 5,
  };

  const response = await request
    .post(`/api/product`)
    .set("Authorization", `Bearer ${jwtToken}`)
    .send(productData);

  expect(response.status).toBe(400);
  expect(response.body.errors[0].msg).toBe("Barcode must be exactly 6 characters long.");
});

test("update product", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
  });
  await product.save();

  const updatedData = {
    article: "Jeans",
    size: "L",
    barcode: "001938", // Must remain the same
    productNum: "1233874659",
    price: 29.99,
    stock: 12,
  };

  const response = await request
    .put(`/api/product/${product.id}`)
    .set("Authorization", `Bearer ${jwtToken}`)
    .send(updatedData);

  expect(response.status).toBe(200);
  expect(response.body.article).toBe("Jeans");
  expect(response.body.price).toBe(29.99);
});

test("update product - not found", async () => {
  const updatedData = {
    article: "Updated Jeans",
    size: "L",
    barcode: "001938",
    productNum: "1233874659",
    price: 29.99,
    stock: 12,
  };
const newId = new mongoose.Types.ObjectId().toString();
  const response = await request
  .put(`/api/product/${newId}`)
    .set("Authorization", `Bearer ${jwtToken}`)
    .send(updatedData);

  expect(response.status).toBe(404);
  expect(response.body.error).toBe("Product not found.");
});

test("delete product", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
  });
  await product.save();

  const response = await request
    .delete(`/api/product/${product.id}`)
    .set("Authorization", `Bearer ${jwtToken}`);

  expect(response.status).toBe(204);
});

test("delete product - not found", async () => {
  const newId = new mongoose.Types.ObjectId().toString();
  const response = await request
    .delete(`/api/product/${newId}`)
    .set("Authorization", `Bearer ${jwtToken}`);

  expect(response.status).toBe(404);
  expect(response.body.error).toBe("Product not found.");
});

test('GET /all - should return all products', async () => {
  const response = await supertest(app)
    .get('/api/product/all')
    .set('Authorization', `Bearer ${jwtToken}`);
  
  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
});

test('GET /:id - should return product by id', async () => {
  const newProduct = await Product.create({
    article: 'Jeans',
    size: 'M',
    barcode: '001938',
    productNum: '1234567890',
    price: 29.99,
    stock: 10,
  });

  const response = await supertest(app)
    .get(`/api/product/${newProduct.id}`)
    .set('Authorization', `Bearer ${jwtToken}`);

  expect(response.status).toBe(200);
  expect(response.body.id).toBe(newProduct.id);
});

test('GET /:id - should return 404 for non-existent product', async () => {
  const newId = '60c72b2f9b1d4c5b44c1e4b2'; // Ein ungültiger ObjectId
  const response = await supertest(app)
    .get(`/api/product/${newId}`)
    .set('Authorization', `Bearer ${jwtToken}`);

  expect(response.status).toBe(404);
  expect(response.body.error).toBe('Product not found.');
});

test('POST / - should create a new product', async () => {
  const productData = {
    article: 'T-Shirt',
    size: 'M',
    barcode: '001939',
    productNum: '1234567890',
    price: 19.99,
    stock: 5,
  };

  const response = await supertest(app)
    .post('/api/product')
    .set('Authorization', `Bearer ${jwtToken}`)
    .send(productData);

  expect(response.status).toBe(201);
  expect(response.body.article).toBe(productData.article);
});

test('PUT /:id - should update an existing product', async () => {
  const newProduct = await Product.create({
    article: 'Hoodie',
    size: 'L',
    barcode: '001940',
    productNum: '1234567890',
    price: 39.99,
    stock: 15,
  });

  const updatedData = {
    article: 'Updated Hoodie',
    size: 'L',
    barcode: '001940',
    productNum: '1234567890',
    price: 34.99,
    stock: 10,
  };

  const response = await supertest(app)
    .put(`/api/product/${newProduct.id}`)
    .set('Authorization', `Bearer ${jwtToken}`)
    .send(updatedData);

  expect(response.status).toBe(200);
  expect(response.body.article).toBe(updatedData.article);
});

test('DELETE /:id - should delete a product', async () => {
  const newProduct = await Product.create({
    article: 'Cap',
    size: 'M',
    barcode: '001941',
    productNum: '1234567890',
    price: 15.99,
    stock: 20,
  });

  const response = await supertest(app)
    .delete(`/api/product/${newProduct.id}`)
    .set('Authorization', `Bearer ${jwtToken}`);

  expect(response.status).toBe(204);
});

test('DELETE /:id - should return 404 for non-existent product', async () => {
  const newId = '60c72b2f9b1d4c5b44c1e4b2'; 
  const response = await supertest(app)
    .delete(`/api/product/${newId}`)
    .set('Authorization', `Bearer ${jwtToken}`);

  expect(response.status).toBe(404);
  expect(response.body.error).toBe('Product not found.');
});

test("GET /api/product/all - should handle errors", async () => {
  const response = await supertest(app)
    .get('/api/product/all')
    .set('Authorization', `Bearer ${jwtToken}`);
  
  expect(response.status).toBe(200);
});


test("PUT /api/product/:id - should return 400 if validation fails", async () => {
  const newProduct = await Product.create({
    article: 'Jeans',
    size: 'M',
    barcode: '001938',
    productNum: '1234567890',
    price: 29.99,
    stock: 10,
  });

  const response = await supertest(app)
    .put(`/api/product/${newProduct.id}`)
    .set('Authorization', `Bearer ${jwtToken}`)
    .send({
      article: '', 
      size: 'M',
      barcode: '001938',
      productNum: '1234567890',
      price: 29.99,
      stock: 10,
    });

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual(expect.objectContaining({
    msg: "Invalid value",
  }));
});

test("DELETE /api/product/:id - should return 400 if validation fails", async () => {
  const newId = "invalidId";

  const response = await supertest(app)
    .delete(`/api/product/${newId}`)
    .set('Authorization', `Bearer ${jwtToken}`);

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual(expect.objectContaining({
    msg: "Invalid value",
  }));
});

test("POST error when creating product fails", async() => {
  const productData: ProductResource = {
    article: "Sample Article",
    size: "M",
    price: 3,
    barcode: "123456",
    productNum: "1234567890",
    stock: 10
  };
  await createProduct(productData);

  const request = supertest(app);
  const response = await request.post(`/api/product/`).set("Authorization", `Bearer ${jwtToken}`).send(productData);
  expect(response.statusCode).toBe(404);
  expect(response.body.error).toBe("A product with the same barcode already exists.");
})