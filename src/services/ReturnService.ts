import { Return } from "../models/ReturnModel";
import { ReturnResource } from "src/Resources";
import { updateStock } from "./StockService";
import { InventoryMovement } from "../models/IventoryMovementModel";

export async function getAllReturns(): Promise<ReturnResource[]> {
  const returns = await Return.find().exec();

  return returns.map((returnEntry) => ({
    id: returnEntry._id.toString(),

    products: returnEntry.products.map((item) => ({
      productId: item.productId.toString(),
      name: item.name,
      quantity: item.quantity,
      reason: item.reason,
    })),
    status: returnEntry.status,
    createdAt: returnEntry.createdAt,
  }));
}

export async function getReturn(id: string): Promise<ReturnResource> {
  const returnEntry = await Return.findById(id).exec();
  if (!returnEntry) {
    throw new Error("Return not found.");
  }

  return {
    id: returnEntry._id.toString(),
    products: returnEntry.products.map((item) => ({
      productId: item.productId.toString(),
      name: item.name,
      quantity: item.quantity,
      reason: item.reason,
    })),
    status: returnEntry.status,
    createdAt: returnEntry.createdAt,
  };
}

export async function createReturn(
  returnResource: ReturnResource
): Promise<ReturnResource> {
  const returnEntry = await Return.create({
    products: returnResource.products.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      reason: item.reason,
    })),
    status: "Pending",
    createdAt: new Date(),
  });

  for (const item of returnResource.products) {
    await updateStock(item.productId, item.quantity);
    const inventoryMovement = new InventoryMovement({
      productId: item.productId,
      name: item.name,
      type: "Return",
      quantity: item.quantity,
      date: returnEntry.createdAt,
    });
    await inventoryMovement.save();
  }

  return {
    id: returnEntry._id.toString(),
    products: returnEntry.products.map((item) => ({
      productId: item.productId.toString(),
      name: item.name,
      quantity: item.quantity,
      reason: item.reason,
    })),
    status: returnEntry.status,
    createdAt: returnEntry.createdAt,
  };
}

export async function updateReturn(
  returnResource: ReturnResource
): Promise<ReturnResource> {
  let returnEntry = await Return.findById(returnResource.id);
  if (!returnEntry) {
    throw new Error("Return not found.");
  } else {
    const updateObject: Partial<{
      products: {
        productId: string;
        name: string;
        quantity: number;
        reason: string;
      }[];
      status: string;
      createdAt: Date;
    }> = {};

    if (returnResource.products) {
      updateObject.products = returnResource.products.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        reason: item.reason,
      }));
    }

    if (returnResource.status) {
      updateObject.status = returnResource.status;
    }

    if (returnResource.createdAt) {
      updateObject.createdAt = returnResource.createdAt;
    }

    await Return.updateOne({ _id: returnResource.id }, updateObject);

    const updatedReturn = await Return.findById(returnResource.id);

    if (!updatedReturn) {
      throw new Error("Return not found.");
    }

    return {
      id: updatedReturn._id.toString(),

      products: updatedReturn.products.map((item) => ({
        productId: item.productId.toString(),
        name: item.name,
        quantity: item.quantity,
        reason: item.reason,
      })),
      status: updatedReturn.status,
      createdAt: updatedReturn.createdAt,
    };
  }
}

export async function deleteReturn(id: string): Promise<void> {
  const returnEntry = await Return.findById(id);
  if (!returnEntry) {
    throw new Error("Return not found");
  }

  await Return.deleteOne({ _id: id });
}
