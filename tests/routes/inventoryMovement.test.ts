import dotenv from "dotenv";
import { Product } from "../../src/models/ProductModel";
import app from "../../src/app";
import { createProduct } from "../../src/services/ProductService";
import supertest from "supertest";
import DB from "tests/DB";
import { createUser } from "../../src/services/UserService";
import { sign } from "jsonwebtoken";
import mongoose from "mongoose";
import { createInventoryMovement } from "../../src/services/InventoryMovementService";
import { InventoryMovementResource, ProductResource } from "../../src/Resources";
import { InventoryMovement } from "../../src/models/IventoryMovementModel";
import { create } from "domain";

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

const inventoryResource: InventoryMovementResource = {
  products: [
    {
      barcode: "123456",
      quantity: 2,
    },
  ],
  movementType: "inbound",
  date: new Date(),
  status: "movement_placed"
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


test("GET /api/inventory-movement/all returns all inventory movements", async () => {

  await createProduct(productResource);
  await createInventoryMovement(inventoryResource);
 
  const response = await request
    .get("/api/inventory/all")
    .set("Authorization", `Bearer ${jwtToken}`);

  expect(response.status).toBe(200);
; 
});

test("GET /api/inventory-movement/:id returns a specific inventory movement", async () => {
  await createProduct(productResource);

  const inventoryMovement = await createInventoryMovement(inventoryResource);

  const response = await request
    .get(`/api/inventory/${inventoryMovement.id}`)
    .set("Authorization", `Bearer ${jwtToken}`);

  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({
    id: inventoryMovement.id,
    movementType: inventoryResource.movementType,
    status: inventoryResource.status,
  });
});

test("GET invalid id", async() => {

  const response = await request
    .get(`/api/inventory/invalidID}`)
    .set("Authorization", `Bearer ${jwtToken}`);
    expect(response.statusCode).toBe(400);

})

test("GET non existing mongo id", async () => {

  const response = await request
    .get(`/api/inventory/${NON_EXISTING_ID}`)
    .set("Authorization", `Bearer ${jwtToken}`);

});

test("POST /api/inventory-movement/ creates a new inventory movement with valid data", async () => {
  const product = await createProduct(productResource);

  const validInventoryData = {
    products: [
      {
        barcode: product.barcode,
        quantity: 5,
      },
    ],
    movementType: "inbound",
    status: "movement_placed",
    date: new Date(),
  };

  const response = await request
    .post("/api/inventory/")
    .set("Authorization", `Bearer ${jwtToken}`)
    .send(validInventoryData);
  expect(response.status).toBe(201);

});


test("POST /api/inventory-movement/ returns 400 if products array is empty", async () => {
  const invalidInventoryData = {
    products: [],
    movementType: "inbound",
    status: "movement_placed",
    date: new Date().toISOString(),
  };

  const response = await request
    .post("/api/inventory/")
    .set("Authorization", `Bearer ${jwtToken}`)
    .send(invalidInventoryData);

  expect(response.status).toBe(400);
  expect(response.body.errors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        msg: "Products must be a non-empty array.",
      }),
    ])
  );
});
test("POST /api/inventory-movement/ returns 400 if any product is missing a valid barcode", async () => {
  const invalidInventoryData = {
    products: [
      { quantity: 2 }, // barcode fehlt
      { barcode: 123456, quantity: 3 }, // barcode ist keine Zeichenkette
    ],
    movementType: "inbound",
    status: "movement_placed",
    date: new Date().toISOString(),
  };

  const response = await request
    .post("/api/inventory/")
    .set("Authorization", `Bearer ${jwtToken}`)
    .send(invalidInventoryData);

  expect(response.status).toBe(400);
  expect(response.body.errors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        msg: "Each product must have a unique barcode.",
      }),
    ])
  );
});
test("POST /api/inventory-movement/ returns 400 if any product has an invalid quantity", async () => {
  const invalidInventoryData = {
    products: [
      { barcode: "123456", quantity: 0 }, // quantity kleiner als 1
      { barcode: "789012", quantity: 1.5 }, // quantity ist keine Ganzzahl
    ],
    movementType: "inbound",
    status: "movement_placed",
    date: new Date().toISOString(),
  };

  const response = await request
    .post("/api/inventory/")
    .set("Authorization", `Bearer ${jwtToken}`)
    .send(invalidInventoryData);

  expect(response.status).toBe(400);
  expect(response.body.errors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        msg: "Each product must have a valid quantity greater than 0.",
      }),
    ])
  );
});

test("PUT successfull update", async() => {
const product = await createProduct(productResource);
const product2 = await createProduct({
  article: "T-Shirt",
  size: "XL",
  barcode: "456789",
  price: 5.99,
  productNum: "3456781320",
  stock: 3
});
const inventory = await  createInventoryMovement(inventoryResource); 
const response = await request.put(`/api/inventory/${inventory.id}`)
.set("Authorization", `Bearer ${jwtToken}`)
.send({
  products: [
    { barcode: product.barcode, quantity: 3 },
    { barcode: product2.barcode, quantity: 2 },
  ],
  movementType: "outbound",
  status: "completed",
});

expect(response.status).toBe(200);
  expect(response.body).toHaveProperty("id", inventory.id);
  expect(response.body.products).toEqual([
    { barcode: product.barcode, quantity: 3 },
    { barcode: product2.barcode, quantity: 2 },
  ]);
  expect(response.body.movementType).toBe("outbound");
  expect(response.body.status).toBe("completed");
});

test("PUT negativ validation error throws 404", async () => {

  const response = await request.put(`/api/inventory/${NON_EXISTING_ID}`)
  .set("Authorization", `Bearer ${jwtToken}`)
  .send({
    products: [
      { barcode: "046729", quantity: 3 },
     
    ],
    movementType: "outbound",
    status: "completed",
  })
  expect(response.statusCode).toBe(404);
});

test("PUT incorrect id throws 400", async () => {

  const response = await request.put(`/api/inventory/invalid`)
  .set("Authorization", `Bearer ${jwtToken}`)
  .send({
    products: [
      { barcode: "046729", quantity: 3 },
     
    ],
    movementType: "outbound",
    status: "completed",
  });
  expect(response.statusCode).toBe(400);
});

test("should return 400 if products is an empty array", async () => {
  const response = await request
    .put(`/api/inventory/${NON_EXISTING_ID}`)
    .set("Authorization", `Bearer ${jwtToken}`)
    .send({
      products: [],
      movementType: "inbound",
      status: "movement_placed",
    });

  expect(response.status).toBe(400);
  expect(response.body.errors[0].msg).toBe("Products must be a non-empty array.");
});

test("should return 400 if any product is missing a barcode", async () => {
  const response = await request
    .put(`/api/inventory/${NON_EXISTING_ID}`)
    .set("Authorization", `Bearer ${jwtToken}`)
    .send({
      products: [
        { quantity: 10 },
        { barcode: "123456789", quantity: 5 },
      ],
      movementType: "inbound",
      status: "movement_placed",
    });

  expect(response.status).toBe(400);
  expect(response.body.errors[0].msg).toBe("Each product must have a valid barcode.");
});

test("should return 400 if any product barcode is not a string", async () => {
  const response = await request
    .put(`/api/inventory/${NON_EXISTING_ID}`)
    .set("Authorization", `Bearer ${jwtToken}`)
    .send({
      products: [
        { barcode: 123456789, quantity: 10 },
        { barcode: "987654321", quantity: 5 },
      ],
      movementType: "inbound",
      status: "movement_placed",
    });

  expect(response.status).toBe(400);
  expect(response.body.errors[0].msg).toBe("Each product must have a valid barcode.");
});

test("should return 400 if any product quantity is less than 1", async () => {
  const response = await request
    .put(`/api/inventory/${NON_EXISTING_ID}`)
    .set("Authorization", `Bearer ${jwtToken}`)
    .send({
      products: [
        { barcode: "123456789", quantity: 0 },
        { barcode: "987654321", quantity: 5 },
      ],
      movementType: "inbound",
      status: "movement_placed",
    });

  expect(response.status).toBe(400);
  expect(response.body.errors[0].msg).toBe("Each product must have a valid quantity greater than 0.");
});

test("should return 400 if any product quantity is not an integer", async () => {
  const response = await request
    .put(`/api/inventory/${NON_EXISTING_ID}`)
    .set("Authorization", `Bearer ${jwtToken}`)
    .send({
      products: [
        { barcode: "123456789", quantity: 2.5 },
        { barcode: "987654321", quantity: 5 },
      ],
      movementType: "inbound",
      status: "movement_placed",
    });

  expect(response.status).toBe(400);
  expect(response.body.errors[0].msg).toBe("Each product must have a valid quantity greater than 0.");
});


test("DELETE successful inventory movement deletion", async () => {
  const product = await createProduct(productResource);
  const inventory = await createInventoryMovement({
    products: [
      { barcode: product.barcode, quantity: 10 },
     
    ],
    movementType: "inbound",
    status: "movement_placed",
    date: new Date()
  });

  const response = await request
    .delete(`/api/inventory/${inventory.id}`)
    .set("Authorization", `Bearer ${jwtToken}`);

  expect(response.status).toBe(204);
 
});


test("DELETE invalid mongo id", async () => {
  const invalidID = "invalid";
  const response = await request.delete(`/api/inventory/${invalidID}`)
  .set("Authorization", `Bearer ${jwtToken}`);

  expect(response.statusCode).toBe(400);
}) ;

test("DELETE non existing mongo id", async () => {
  const response = await request.delete(`/api/inventory/${NON_EXISTING_ID}`)
  .set("Authorization", `Bearer ${jwtToken}`);
  expect(response.statusCode).toBe(404);
})