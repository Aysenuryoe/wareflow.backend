import { logger } from "../../src/logger";
import { Product } from "../../src/models/ProductModel";
import { SalesOrder } from "../../src/models/SalesOrderModel";
import { SalesOrderResource } from "../../src/Resources";
import { decreaseStock, increaseStock } from "../services/StockService";

export async function getAllSalesOrders(): Promise<SalesOrderResource[]> {
  const salesOrders = await SalesOrder.find().exec();

  const salesResources: SalesOrderResource[] = salesOrders.map(
    (salesOrder) => ({
      id: salesOrder.id,
      products: salesOrder.products.map((item) => ({
        barcode: item.barcode,
        price: item.price,
        quantity: item.quantity,
      })),

      saleDate: salesOrder.saleDate,
      source: salesOrder.source,
    })
  );

  return salesResources;
}

export async function getSalesOrder(id: string): Promise<SalesOrderResource> {
  const salesOrder = await SalesOrder.findById(id).exec();
  if (!salesOrder) {
    const errorMsg = "Sales order not found.";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
  return {
    id: salesOrder.id,
    products: salesOrder.products.map((item) => ({
      barcode: item.barcode,
      price: item.price,
      quantity: item.quantity,
    })),

    saleDate: salesOrder.saleDate,
    source: salesOrder.source,
  };
}

export async function createSalesOrder(
  salesOrderResource: SalesOrderResource
): Promise<SalesOrderResource> {
  const salesOrder = await SalesOrder.create({
    products: salesOrderResource.products.map((item) => ({
      barcode: item.barcode,
      price: item.price,
      quantity: item.quantity,
    })),
    saleDate: salesOrderResource.saleDate,
    source: "store",
  });

  for (const item of salesOrderResource.products) {
    try {
      await decreaseStock(item.barcode, item.quantity);
    } catch (error) {
      // Wenn der Bestand für eines der Produkte nicht ausreicht, wird die Bestellung abgebrochen.
      // Die Verkaufsbestellung wird in diesem Fall zurückgerollt.
      await SalesOrder.findByIdAndDelete(salesOrder._id);
      if (error instanceof Error) {
        throw new Error(
          `Failed to create sales order: ${error.message}. Sales order was rolled back.`
        );
      }
    }
  }

  return {
    id: salesOrder._id.toString(),
    products: salesOrder.products.map((item) => ({
      barcode: item.barcode,
      price: item.price,
      quantity: item.quantity,
    })),
    saleDate: salesOrder.saleDate,
    source: salesOrder.source,
  };
}

export async function updateSalesOrder(
  salesOrderResource: SalesOrderResource
): Promise<SalesOrderResource> {
  let salesOrder = await SalesOrder.findById(salesOrderResource.id);
  if (!salesOrder) {
    const errorMsg = "Sales order not found.";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (salesOrderResource.products) {
    const barcodes = salesOrderResource.products.map(
      (product) => product.barcode
    );

    const products = await Product.find({ barcode: { $in: barcodes } });

    if (products.length !== salesOrderResource.products.length) {
      const missingBarcodes = barcodes.filter(
        (barcode) => !products.some((product) => product.barcode === barcode)
      );
      const errorMsg = `One or more products do not exist. Missing barcodes: ${missingBarcodes.join(
        ", "
      )}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  // Überprüfen und Bestände aktualisieren, wenn sich die Menge geändert hat
  if (salesOrderResource.products) {
    for (const newProduct of salesOrderResource.products) {
      const oldProduct = salesOrder.products.find(
        (item) => item.barcode === newProduct.barcode
      );

      if (oldProduct && oldProduct.quantity !== newProduct.quantity) {
        const quantityDifference = newProduct.quantity - oldProduct.quantity;

        try {
          if (quantityDifference > 0) {
            // Menge hat zugenommen -> Lagerbestand muss verringert werden
            await decreaseStock(newProduct.barcode, quantityDifference);
          } else if (quantityDifference < 0) {
            // Menge hat abgenommen -> Lagerbestand muss erhöht werden
            await increaseStock(
              newProduct.barcode,
              Math.abs(quantityDifference)
            );
          }
        } catch (error) {
          const errorMsg = `Failed to update stock for product with barcode ${
            newProduct.barcode
          }: ${error instanceof Error ? error.message : "Unknown error"}`;
          logger.error(errorMsg);
          throw new Error(errorMsg);
        }
      }
    }

    // Update-Objekt für die Produkte aktualisieren
    const updateObject: {
      products?: {
        barcode: string;
        price: number;
        quantity: number;
      }[];
      saleDate?: Date;
      source?: string;
    } = {};

    updateObject.products = salesOrderResource.products.map((item) => ({
      barcode: item.barcode,
      price: item.price,
      quantity: item.quantity,
    }));

    if (salesOrderResource.saleDate) {
      updateObject.saleDate = new Date(salesOrderResource.saleDate);
    }

    // Verkaufsbestellung aktualisieren
    salesOrder = await SalesOrder.findByIdAndUpdate(
      salesOrderResource.id,
      updateObject,
      { new: true }
    );

    if (!salesOrder) {
      const errorMsg = "Sales order not found after update.";
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  return {
    id: salesOrder._id.toString(),
    products: salesOrder.products.map((item) => ({
      barcode: item.barcode,
      price: item.price,
      quantity: item.quantity,
    })),
    saleDate: salesOrder.saleDate,
    source: salesOrder.source,
  };
}

export async function deleteSalesOrder(id: string): Promise<void> {
  const salesOrder = await SalesOrder.findById(id).exec();

  if (!salesOrder) {
    const errorMsg = "Sales order not found.";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  for (const item of salesOrder.products) {
    try {
      await increaseStock(item.barcode, item.quantity);
    } catch (error) {
      const errorMsg = `Failed to increase stock for product with barcode ${
        item.barcode
      }: ${error instanceof Error ? error.message : "Unknown error"}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  await SalesOrder.deleteOne({ _id: id });
}
