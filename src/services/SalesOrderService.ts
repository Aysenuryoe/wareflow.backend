import { SalesOrder } from "../models/SalesOrderModel";
import { SalesOrderResource } from "src/Resources";
import { updateStock } from "./StockService";
import { InventoryMovement } from "../models/IventoryMovementModel";

export async function getAllSales(): Promise<SalesOrderResource[]> {
  let sales = await SalesOrder.find().exec();
  const salesOrderResources: SalesOrderResource[] = sales.map((sale) => ({
    id: sale.id,
    products: sale.products.map((item) => ({
      productId: item.productId.toString(),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    totalAmount: sale.totalAmount,
    createdAt: sale.createdAt,
  }));

  return salesOrderResources;
}

export async function getSaleOrder(id: string): Promise<SalesOrderResource> {
  let sale = await SalesOrder.findById(id).exec();
  if (!sale) {
    throw new Error("Sale not found.");
  } else {
    return {
      id: sale.id,
      products: sale.products.map((item) => ({
        productId: item.productId.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount: sale.totalAmount,
      createdAt: sale.createdAt,
    };
  }
}

export async function createSaleOrder(
  salesOrderResources: SalesOrderResource
): Promise<SalesOrderResource> {
  let sale = await SalesOrder.create({
    products: salesOrderResources.products.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    totalAmount: salesOrderResources.totalAmount,
    createdAt: salesOrderResources.createdAt,
  });

  for (const item of salesOrderResources.products) {
    await updateStock(item.productId, -item.quantity);
    const inventoryMovement = new InventoryMovement({
      productId: item.productId,
      name: item.name,
      type: "Outbound",
      quantity: item.quantity,
      date: sale.createdAt,
    });
    await inventoryMovement.save();
  }

  return {
    id: sale.id,
    products: sale.products.map((item) => ({
      productId: item.productId.toString(),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    totalAmount: sale.totalAmount,
    createdAt: sale.createdAt,
  };
}

export async function updateSale(
  salesOrderResource: SalesOrderResource
): Promise<SalesOrderResource> {
  let sale = await SalesOrder.findById(salesOrderResource.id);

  if (!sale) {
    throw new Error("Sale not found.");
  } else {
    const updateObject: {
      products?: {
        productId: string;
        name: string;
        price: number;
        quantity: number;
      }[];
      totalAmount?: number;
      createdAt?: Date;
    } = {};

    if (salesOrderResource.products) {
      updateObject.products = salesOrderResource.products.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));
    }

    if (salesOrderResource.createdAt) {
      updateObject.createdAt = salesOrderResource.createdAt;
    }

    await SalesOrder.updateOne(
      {
        _id: salesOrderResource.id,
      },
      updateObject
    );
    sale = await SalesOrder.findById(salesOrderResource.id);
    return {
      id: sale!.id,
      products: sale!.products.map((item) => ({
        productId: item.productId.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount: sale!.totalAmount,
      createdAt: sale!.createdAt,
    };
  }
}

export async function deleteSalesOrder(id: string): Promise<void> {
  let salesOrder = await SalesOrder.findById(id);
  if (!salesOrder) {
    throw new Error("Sale not found.");
  } else {
    await SalesOrder.deleteOne({ _id: id });
  }
}
