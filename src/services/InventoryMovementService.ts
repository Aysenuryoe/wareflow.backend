import { InventoryMovement } from "../../src/models/IventoryMovementModel";
import { InventoryMovementResource } from "../../src/Resources";
import { logger } from "../../src/logger";
import { Product } from "../../src/models/ProductModel";

export async function getAllInventoryMovements(): Promise<InventoryMovementResource[]> {
  const inventoryMovements = await InventoryMovement.find().exec();
  return inventoryMovements.map((movement) => ({
    products: movement.products.map((product) => ({
      barcode: product.barcode,
      quantity: product.quantity,
    })),
    movementType: movement.movementType,
    date: movement.date,
    status: movement.status,
    remarks: movement.remarks,
  }));
}

export async function getInventoryMovement(id: string): Promise<InventoryMovementResource> {
  const inventoryMovement = await InventoryMovement.findById(id);

  if (!inventoryMovement) {
    const errorMsg = "Inventory not found.";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  return {
    id: inventoryMovement._id.toString(),
    products: inventoryMovement.products.map((product) => ({
      barcode: product.barcode,
      quantity: product.quantity,
    })),
    movementType: inventoryMovement.movementType,
    date: inventoryMovement.date,
    status: inventoryMovement.status,
    remarks: inventoryMovement.remarks,
  };
}

export async function createInventoryMovement(inventoryMovementResource: InventoryMovementResource): Promise<InventoryMovementResource> {
  const existingProducts = await Product.find({
    barcode: { $in: inventoryMovementResource.products.map((p) => p.barcode) },
  });

  if (existingProducts.length !== inventoryMovementResource.products.length) {
    const errorMsg = "One or more products do not exist.";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  const inventoryMovement = await InventoryMovement.create({
    products: inventoryMovementResource.products,
    movementType: inventoryMovementResource.movementType,
    date: new Date(),
    status: "movement_placed",
    remarks: inventoryMovementResource.remarks,
  });

  return {
    id: inventoryMovement._id.toString(),
    products: inventoryMovement.products.map((product) => ({
      barcode: product.barcode,
      quantity: product.quantity,
    })),
    movementType: inventoryMovement.movementType,
    date: inventoryMovement.date,
    status: inventoryMovement.status,
    remarks: inventoryMovement.remarks,
  };
}

export async function updateInventoryMovement(inventoryMovementResource: InventoryMovementResource): Promise<InventoryMovementResource> {
  let inventory = await InventoryMovement.findById(inventoryMovementResource.id);
  if (!inventory) {
    const errorMsg = "Inventory not found.";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  const updateObject: {
    id?: string;
    products?: {
  
      barcode: string;
      quantity: number;
    }[];
    movementType?: "inbound" | "outbound";
    date?: Date;
    status?: "movement_placed" | "pending" | "completed" | "canceled";
    remarks?: string;
  } = {};

  if (inventoryMovementResource.products) {
    updateObject.products = inventoryMovementResource.products.map((product) => ({
      barcode: product.barcode,
      quantity: product.quantity,
    }));
  }

  if (inventoryMovementResource.movementType) {
    updateObject.movementType = inventoryMovementResource.movementType;
  }
  if (inventoryMovementResource.date) {
    updateObject.date = inventoryMovementResource.date;
  }
  if (inventoryMovementResource.status) {
    updateObject.status = inventoryMovementResource.status;
  }
  if (inventoryMovementResource.remarks) {
    updateObject.remarks = inventoryMovementResource.remarks;
  }

  await InventoryMovement.updateOne({ _id: inventoryMovementResource.id }, updateObject);

  inventory = await InventoryMovement.findById(inventoryMovementResource.id).exec();

  return {
    id: inventory!._id.toString(),
    products: inventory!.products.map((item) => ({
      barcode: item.barcode,
      quantity: item.quantity,
    })),
    movementType: inventory!.movementType,
    date: inventory!.date,
    status: inventory!.status,
    remarks: inventory!.remarks,
  };
}

export async function deleteInventoryMovement(id: string): Promise<void> {
  const inventory = await InventoryMovement.findById(id);
  if (!inventory) {
    const errorMsg = "Inventory not found.";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
  await InventoryMovement.deleteOne({ _id: id });
}
