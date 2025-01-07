import { PurchaseOrder } from "../models/PurchaseOrderModel";
import { PurchaseOrderResource } from "src/Resources";

export async function getAllPurchaseOrders(): Promise<PurchaseOrderResource[]> {
  let purchases = await PurchaseOrder.find().exec();
  const purchaseOrderResources: PurchaseOrderResource[] = purchases.map(
    (purchase) => ({
      id: purchase.id,
      products: purchase.products.map((item) => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
      })),
      supplier: purchase.supplier,
      status: purchase.status,
      orderDate: purchase.orderDate,
      receivedDate: purchase.receivedDate,
    })
  );
  return purchaseOrderResources;
}

export async function getPurchaseOrder(
  id: string
): Promise<PurchaseOrderResource> {
  let purchase = await PurchaseOrder.findById(id).exec();
  if (!purchase) {
    throw new Error("Purchase not found.");
  } else {
    return {
      id: purchase.id,
      products: purchase.products.map((item) => ({
        productId: item.productId.toString(),
        size: item.size,
        quantity: item.quantity,
      })),
      supplier: purchase.supplier,
      status: purchase.status,
      orderDate: purchase.orderDate,
      receivedDate: purchase.receivedDate,
    };
  }
}

export async function createPurchaseOrder(
  purchaseOrderResource: PurchaseOrderResource
): Promise<PurchaseOrderResource> {
  let purchase = await PurchaseOrder.create({
    products: purchaseOrderResource.products.map((item) => ({
      productId: item.productId,
      size: item.size,
      quantity: item.quantity,
    })),
    supplier: purchaseOrderResource.supplier,
    status: purchaseOrderResource.status,
    orderDate: purchaseOrderResource.orderDate,
    receivedDate: purchaseOrderResource.receivedDate,
  });

  return {
    id: purchase.id,
    products: purchase.products.map((item) => ({
      productId: item.productId,
      size: item.size,
      quantity: item.quantity,
    })),
    supplier: purchase.supplier,
    status: purchase.status,
    orderDate: purchase.orderDate,
    receivedDate: purchase.receivedDate,
  };
}

export async function updatePurchaseOrder(
  purchaseOrderResource: PurchaseOrderResource
): Promise<PurchaseOrderResource> {
  let purchase = await PurchaseOrder.findById(purchaseOrderResource.id);

  if (!purchase) {
    throw new Error("Purchase not found.");
  } else {
    const updateObject: {
      products?: {
        productId: string;
        size: string;
        quantity: number;
      }[];
      supplier?: string;
      status?: string;
      orderDate?: Date;
      receivedDate?: Date;
    } = {};

    if (purchaseOrderResource.products) {
      updateObject.products = purchaseOrderResource.products.map((item) => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
      }));
    }

    if (purchaseOrderResource.supplier) {
      updateObject.supplier = purchaseOrderResource.supplier;
    }
    if (purchaseOrderResource.status) {
      updateObject.status = purchaseOrderResource.status;
    }

    if (purchaseOrderResource.orderDate) {
      updateObject.orderDate = purchaseOrderResource.orderDate;
    }

    if (purchaseOrderResource.receivedDate) {
      updateObject.receivedDate = purchaseOrderResource.receivedDate;
    }

    await PurchaseOrder.updateOne(
      {
        _id: purchaseOrderResource.id,
      },
      updateObject
    );
    purchase = await PurchaseOrder.findById(purchaseOrderResource.id);
    return {
      id: purchase!.id,
      products: purchase!.products.map((item) => ({
        productId: item.productId.toString(),
        size: item.size,
        quantity: item.quantity,
      })),
      supplier: purchase!.supplier,
      status: purchase!.status,
      orderDate: purchase!.orderDate,
      receivedDate: purchase!.receivedDate,
    };
  }
}

export async function deletePurchase(id: string): Promise<void> {
  let purchase = await PurchaseOrder.findById(id);
  if (!purchase) {
    throw new Error("Purchase not found.");
  } else {
    await PurchaseOrder.deleteOne({ _id: id });
  }
}
