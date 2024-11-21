import dotenv from "dotenv";
import app from "../../src/app";
import supertest from "supertest";
import DB from "tests/DB";
import { createUser } from "../../src/services/UserService";
import { sign } from "jsonwebtoken";
import mongoose from "mongoose";
import { createProduct } from "../../src/services/ProductService";

dotenv.config();

let userId: string;
let jwtToken: string;
const INVALID_ID = "invalid id";
const NON_EXISTING_ID = new mongoose.Types.ObjectId().toString();

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

test("successfully increases stock", async () => {
  const product = await createProduct({
    article: "Test Product",
    size: "M",
    barcode: "123456",
    price: 20.0,
    productNum: "1234567890",
    stock: 10,
  });

  const response = await request.post(`/api/stock/increase`).send({
    barcode: product.barcode,
    quantity: 5,
  });

  expect(response.status).toBe(200);
  expect(response.body.stock).toBe(15);
});

test("should return 400 because of invalid mongo id", async () => {
  const response = await request.post(`/api/stock/increase`).send({
    productId: INVALID_ID,
    quantity: 5,
  });

  expect(response.statusCode).toBe(400);
});

test("should return 404 because of non existing mongo id", async () => {
  const response = await request.post(`/api/stock/increase`).send({
    barcode: "123459",
    quantity: 5,
  });

  expect(response.statusCode).toBe(404);
});

test("successfully decreases stock", async () => {
  const product = await createProduct({
    article: "Test Product",
    size: "M",
    barcode: "123456",
    price: 20.0,
    productNum: "1234567890",
    stock: 10,
  });

  const response = await request.post(`/api/stock/decrease`).send({
    barcode: product.barcode,
    quantity: 5,
  });

  expect(response.status).toBe(200);
  expect(response.body.stock).toBe(5);
});

test("should return 400", async () => {
  const response = await request.post(`/api/stock/decrease`).send({
    productId: INVALID_ID,
    quantity: 5,
  });
  expect(response.statusCode).toBe(400);
});

test("should return 404", async () => {
  const response = await request.post(`/api/stock/decrease`).send({
    barcode: "123493",
    quantity: 5,
  });
  expect(response.statusCode).toBe(404);
});
