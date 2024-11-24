import { logger } from "../../src/logger";
import { Product } from "../../src/models/ProductModel";
import { PurchaseOrder } from "../../src/models/PurchaseOrderModel";
import { PurchaseOrderResource } from "../../src/Resources";
import { increaseStock } from "./StockService";

export async function getAllPurchaseOrders(): Promise<PurchaseOrderResource[]> {
  const purchaseOrders = await PurchaseOrder.find().exec();
  const purchaseOrderResources: PurchaseOrderResource[] = purchaseOrders.map(
    (purchaseOrder) => ({
      id: purchaseOrder.id,
      products: purchaseOrder.products.map((item) => ({
        barcode: item.barcode,
        quantity: item.quantity,
      })),

      status: purchaseOrder.status,
      orderDate: purchaseOrder.orderDate,
      receivedDate: purchaseOrder.receivedDate,
    })
  );

  return purchaseOrderResources;
}

export async function getPurchaseOrder(
  id: string
): Promise<PurchaseOrderResource> {
  const purchaseOrder = await PurchaseOrder.findById(id);
  if (!purchaseOrder) {
    const errorMsg = "Purchase order not found.";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
  const purchaseOrderResource: PurchaseOrderResource = {
    id: purchaseOrder.id,
    products: purchaseOrder.products.map((item) => ({
      barcode: item.barcode,
      quantity: item.quantity,
    })),

    status: purchaseOrder.status,
    orderDate: purchaseOrder.orderDate,
    receivedDate: purchaseOrder.receivedDate,
  };

  return purchaseOrderResource;
}

export async function createPurchaseOrder(
  purchaseOrderResource: PurchaseOrderResource
): Promise<PurchaseOrderResource> {
  const existingProducts = await Product.find({
    barcode: {
      $in: purchaseOrderResource.products.map((product) => product.barcode),
    },
  });

  if (existingProducts.length !== purchaseOrderResource.products.length) {
    const errorMsg = "One or more products do not exist.";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
  const purchaseOrder = await PurchaseOrder.create({
    products: purchaseOrderResource.products.map((item) => ({
      barcode: item.barcode,
      quantity: item.quantity,
    })),

    orderDate: new Date(purchaseOrderResource.orderDate),
    status: purchaseOrderResource.status,
  });

  return {
    id: purchaseOrder.id,
    products: purchaseOrder.products.map((item) => ({
      barcode: item.barcode,
      quantity: item.quantity,
    })),

    orderDate: purchaseOrder.orderDate,
    status: purchaseOrder.status,
    receivedDate: purchaseOrder.receivedDate,
  };
}

export async function updatePurchaseOrder(
  purchaseOrderResource: PurchaseOrderResource
): Promise<PurchaseOrderResource> {
  let purchaseOrder = await PurchaseOrder.findById(
    purchaseOrderResource.id
  ).exec();

  if (!purchaseOrder) {
    const errorMsg = "Purchase order not found.";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Überprüfen, ob sich der Status von "nicht Arrived" zu "Arrived" geändert hat
  const statusChangedToArrived =
    purchaseOrderResource.status === "Arrived" &&
    purchaseOrder.status !== "Arrived";

  const updateObject: {
    id?: string;
    products?: {
      barcode: string;
      quantity: number;
    }[];
    orderDate?: Date;
    status?: "Ordered" | "Pending" | "Arrived" | "Cancelled";
    supplier?: string;
  } = {};

  if (purchaseOrderResource.products) {
    updateObject.products = purchaseOrderResource.products.map((product) => ({
      barcode: product.barcode,
      quantity: product.quantity,
    }));
  }

  if (purchaseOrderResource.orderDate) {
    updateObject.orderDate = new Date(purchaseOrderResource.orderDate);
  }
  if (purchaseOrderResource.status) {
    updateObject.status = purchaseOrderResource.status;
  }

  await PurchaseOrder.updateOne(
    { _id: purchaseOrderResource.id },
    updateObject
  );

  // Erhöhe den Warenbestand, wenn der Status geändert wurde und jetzt "Arrived" ist
  if (statusChangedToArrived && purchaseOrderResource.products) {
    for (const product of purchaseOrderResource.products) {
      try {
        await increaseStock(product.barcode, product.quantity);
      } catch (error) {
        const errorMsg = `Failed to increase stock for product with barcode ${
          product.barcode
        }: ${error instanceof Error ? error.message : "Unknown error"}`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }
    }
  }

  purchaseOrder = await PurchaseOrder.findById(purchaseOrderResource.id).exec();

  return {
    id: purchaseOrder!._id.toString(),
    products: purchaseOrder!.products.map((item) => ({
      barcode: item.barcode,
      quantity: item.quantity,
    })),
    orderDate: purchaseOrder!.orderDate,
    status: purchaseOrder!.status,
    receivedDate: purchaseOrder!.receivedDate,
  };
}

export async function deletePurchaseOrder(id: string): Promise<void> {
  const purchaseOrder = await PurchaseOrder.findById(id);
  if (!purchaseOrder) {
    const errorMsg = "Purchase order not found.";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  } else {
    await PurchaseOrder.deleteOne({ _id: id });
  }
}
