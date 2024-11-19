import DB from "tests/DB";
import { InventoryMovement } from "../../src/models/IventoryMovementModel";
import { Product } from "../../src/models/ProductModel";
import { createInventoryMovement, getAllInventoryMovements, getInventoryMovement, updateInventoryMovement, deleteInventoryMovement } from "../../src/services/InventoryMovementService";
import { InventoryMovementResource } from "../../src/Resources";
import mongoose, { mongo } from "mongoose";

beforeAll(async () => await DB.connect());
afterEach(async () => await DB.clear());
afterAll(async () => await DB.close());

test("successful creation of inventory movement", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
  });

  await product.save();

  const inventoryMovementResource: InventoryMovementResource = {
    products: [
      {
        barcode: product.barcode,
        quantity: 5,
      },
    ],
    movementType: "inbound",
    date: new Date(),
    status: "movement_placed",
    remarks: "New stock received",
  };

  const createdMovement = await createInventoryMovement(inventoryMovementResource);
  expect(createdMovement.products.length).toBe(1);
  expect(createdMovement.products[0].barcode).toBe(product.barcode);
});

test("should throw error when creating inventory movement with non-existent product", async () => {
  const inventoryMovementResource: InventoryMovementResource  = {
    products: [
      {
        barcode: "non-existent-barcode",
        quantity: 5,
      },
    ],
    movementType: "inbound",
    date: new Date(),
    status: "movement_placed",
  };

  await expect(createInventoryMovement(inventoryMovementResource)).rejects.toThrow("One or more products do not exist.");
});

test("get all inventory movements", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
  });

  await product.save();

  const inventoryMovementResource: InventoryMovementResource  = {
    products: [
      {
        barcode: product.barcode,
        quantity: 5,
      },
    ],
    movementType: "inbound",
    date: new Date(),
    status: "movement_placed",
    remarks: "New stock received",
  };

  await createInventoryMovement(inventoryMovementResource);

  const movements = await getAllInventoryMovements();
  expect(movements.length).toBe(1);
  expect(movements[0].products[0].barcode).toBe(product.barcode);
});

test("get inventory movement by id", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
  });

  await product.save();

  const inventoryMovementResource: InventoryMovementResource = {
    products: [
      {
        barcode: product.barcode,
        quantity: 5,
      },
    ],
    movementType: "inbound",
    date: new Date(),
    status: "movement_placed",
    remarks: "New stock received",
  };

  const createdMovement = await createInventoryMovement(inventoryMovementResource);
  
  expect(createdMovement.id).toBeDefined();
  
  const fetchedMovement = await getInventoryMovement(createdMovement.id!);
  
  expect(fetchedMovement.id).toBe(createdMovement.id);
  expect(fetchedMovement.products[0].barcode).toBe(product.barcode);
});


test("should throw error when getting inventory movement with invalid id", async () => {
  await expect(getInventoryMovement(new mongoose.Types.ObjectId().toString())).rejects.toThrow("Inventory not found.");
});

test("update inventory movement", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
  });

  await product.save();

  const inventoryMovementResource: InventoryMovementResource  = {
    products: [
      {
        barcode: product.barcode,
        quantity: 5,
      },
    ],
    movementType: "inbound",
    date: new Date(),
    status: "movement_placed",
    remarks: "New stock received",
  };

  const createdMovement = await createInventoryMovement(inventoryMovementResource);
  
  const updatedResource: InventoryMovementResource  = {
    id: createdMovement.id,
    products: [
      {
        barcode: product.barcode,
        quantity: 10,
      },
    ],
    movementType: "outbound",
    date: new Date(),
    status: "completed",
    remarks: "Stock dispatched",
  };

  const updatedMovement = await updateInventoryMovement(updatedResource);
  expect(updatedMovement.products[0].quantity).toBe(10);
  expect(updatedMovement.movementType).toBe("outbound");
});

test("should throw error when updating inventory movement with invalid id", async () => {
  const updatedResource: InventoryMovementResource  = {
    id: new mongoose.Types.ObjectId().toString(),
    products: [{ barcode: "001938", quantity: 10 }],
    movementType: "inbound",
    date: new Date(),
    status: "movement_placed",
  };

  await expect(updateInventoryMovement(updatedResource)).rejects.toThrow("Inventory not found.");
});

test("delete inventory movement", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
  });

  await product.save();

  const inventoryMovementResource: InventoryMovementResource = {
    products: [
      {
        barcode: product.barcode,
        quantity: 5,
      },
    ],
    movementType: "inbound",
    date: new Date(),
    status: "movement_placed",
    remarks: "New stock received",
  };

  const createdMovement = await createInventoryMovement(inventoryMovementResource);
  
  expect(createdMovement.id).toBeDefined(); 
  await deleteInventoryMovement(createdMovement.id!); 
  await expect(getInventoryMovement(createdMovement.id!)).rejects.toThrow("Inventory not found.");
});


test("should throw error when deleting inventory movement with invalid id", async () => {
  await expect(deleteInventoryMovement(new mongoose.Types.ObjectId().toString())).rejects.toThrow("Inventory not found.");
});

test("should throw an error when a non existing inventory id", async() => {
  const inventoryMovementResource: InventoryMovementResource = {
    products: [
      {
        barcode: "948593",
        quantity: 5,
      },
    ],
    movementType: "inbound",
    date: new Date(),
    status: "movement_placed",
    remarks: "New stock received",
  };
  expect(updateInventoryMovement(inventoryMovementResource)).rejects.toThrow("Inventory not found.");
});

test("should delete inventory movement", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 10,
  });

  await product.save();

  const inventoryMovementResource: InventoryMovementResource = {
    products: [
      {
        barcode: product.barcode,
        quantity: 5,
      },
    ],
    movementType: "inbound",
    date: new Date(),
    status: "movement_placed",
    remarks: "New stock received",
  };

  const createdMovement = await createInventoryMovement(inventoryMovementResource);
  
  await deleteInventoryMovement(createdMovement.id!);
  
  await expect(getInventoryMovement(createdMovement.id!)).rejects.toThrow("Inventory not found.");
});

test("should throw error when inventory movement not found on delete", async () => {
  await expect(deleteInventoryMovement(new mongoose.Types.ObjectId().toString())).rejects.toThrow("Inventory not found.");
});
