import DB from "tests/DB";
import { InventoryMovement } from "../../src/models/IventoryMovementModel";

beforeAll(async () => await DB.connect());
afterEach(async () => await DB.clear());
afterAll(async () => await DB.close());

test("successful saving of inventory movement", async () => {
  const inventoryMovement = new InventoryMovement({
    products: [
      {
        barcode: "001938",
        quantity: 10,
      },
    ],
    movementType: "inbound",
    date: new Date(),
    status: "movement_placed",
    remarks: "Initial stock added",
  });

  const res = await inventoryMovement.save();
  expect(res.products.length).toBe(1);
  expect(res.products[0].barcode).toBe("001938");
  expect(res.movementType).toBe("inbound");
  expect(res.status).toBe("movement_placed");
});

test("should throw error when quantity is less than 1", async () => {
  const inventoryMovement = new InventoryMovement({
    products: [
      {
        barcode: "001938",
        quantity: 0,
      },
    ],
    movementType: "inbound",
    date: new Date(),
    status: "movement_placed",
  });

  await expect(inventoryMovement.save()).rejects.toThrowError();
});

test("should throw error when movementType is missing", async () => {
  const inventoryMovement = new InventoryMovement({
    products: [
      {
        barcode: "001938",
        quantity: 5,
      },
    ],
    date: new Date(),
    status: "movement_placed",
  });

  await expect(inventoryMovement.save()).rejects.toThrowError();
});

test("should throw error when status is invalid", async () => {
  const inventoryMovement = new InventoryMovement({
    products: [
      {
        barcode: "001938",
        quantity: 5,
      },
    ],
    movementType: "inbound",
    date: new Date(),
    status: "invalid_status",
  });

  await expect(inventoryMovement.save()).rejects.toThrowError();
});
