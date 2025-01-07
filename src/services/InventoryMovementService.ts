import { InventoryMovement } from "../models/IventoryMovementModel";
import { InventoryMovementResource } from "../../src/Resources";
import { Product } from "../../src/models/ProductModel";

export async function getAllInventoryMovements(): Promise<
  InventoryMovementResource[]
> {
  let inventoryMovements = await InventoryMovement.find().exec();
  const inventoryMovementResources: InventoryMovementResource[] =
    inventoryMovements.map((movement) => ({
      id: movement._id.toString(),
      productId: movement.productId.toString(),
      name: movement.name,
      type: movement.type,
      quantity: movement.quantity,
      date: movement.date,
    }));
  return inventoryMovementResources;
}

export async function getInventoryMovement(
  id: string
): Promise<InventoryMovementResource> {
  const inventoryMovement = await InventoryMovement.findById(id).exec();

  if (!inventoryMovement) {
    throw new Error("Inventory movement not found.");
  } else {
    return {
      id: inventoryMovement._id.toString(),
      productId: inventoryMovement.productId.toString(),
      name: inventoryMovement.name,
      type: inventoryMovement.type,
      quantity: inventoryMovement.quantity,
      date: inventoryMovement.date,
    };
  }
}

export async function createInventoryMovement(
  inventoryMovementResource: InventoryMovementResource
): Promise<InventoryMovementResource> {
  const product = await Product.findById(inventoryMovementResource.productId);
  if (!product) {
    throw new Error("Prodct not found.");
  } else {
    if (inventoryMovementResource.type === "Inbound") {
      product.stock += inventoryMovementResource.quantity;
    } else if (
      ["Outbound", "Return", "Adjustment"].includes(
        inventoryMovementResource.type
      )
    ) {
      if (product.stock < inventoryMovementResource.quantity) {
        throw new Error("Insufficient stock for this movement.");
      }
      product.stock -= inventoryMovementResource.quantity;
    }
    await product.save();

    const inventoryMovement = await InventoryMovement.create({
      productId: inventoryMovementResource.productId,
      name: inventoryMovementResource.name,
      type: inventoryMovementResource.type,
      quantity: inventoryMovementResource.quantity,
      date: inventoryMovementResource.date,
    });

    return {
      id: inventoryMovement._id.toString(),
      productId: inventoryMovement.productId.toString(),
      name: inventoryMovement.name,
      type: inventoryMovement.type,
      quantity: inventoryMovement.quantity,
      date: inventoryMovement.date,
    };
  }
}

export async function updateInventoryMovement(
  inventoryMovementResource: InventoryMovementResource
): Promise<InventoryMovementResource> {
  let inventoryMovement = await InventoryMovement.findById(
    inventoryMovementResource.id
  );
  if (!inventoryMovement) {
    throw new Error("Inventory movement not found.");
  } else {
    const updateObject: {
      productId?: string;
      type?: string;
      quantity?: number;
      date?: Date;
    } = {};

    if (inventoryMovementResource.productId) {
      updateObject.productId = inventoryMovementResource.productId;
    }
    if (inventoryMovementResource.type) {
      updateObject.type = inventoryMovementResource.type;
    }
    if (inventoryMovementResource.quantity) {
      updateObject.quantity = inventoryMovementResource.quantity;
    }
    if (inventoryMovementResource.date) {
      updateObject.date = inventoryMovementResource.date;
    }

    await InventoryMovement.updateOne(
      {
        _id: inventoryMovementResource.id,
      },
      updateObject
    );

    inventoryMovement = await InventoryMovement.findById(
      inventoryMovementResource.id
    );
    return {
      id: inventoryMovement!.id,
      productId: inventoryMovement!.productId.toString(),
      name: inventoryMovement!.name,
      type: inventoryMovement!.type,
      quantity: inventoryMovement!.quantity,
      date: inventoryMovement!.date,
    };
  }
}

export async function deleteInventoryMovement(id: string): Promise<void> {
  const inventoryMovement = await InventoryMovement.findById(id);
  if (!inventoryMovement) {
    throw new Error("Inventory movement not found.");
  }

  await InventoryMovement.deleteOne({ _id: id });
}
