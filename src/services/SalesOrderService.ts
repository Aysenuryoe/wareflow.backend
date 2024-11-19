import { ObjectId, Types } from "mongoose";
import { logger } from "../../src/logger";
import { Product } from "../../src/models/ProductModel";
import { SalesOrder } from "../../src/models/SalesOrderModel";
import { SalesOrderResource } from "../../src/Resources";

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
  const existingProducts = await Product.find({
    barcode: {
      $in: salesOrderResource.products.map((product) => product.barcode),
    },
  }).exec();

  if (existingProducts.length !== salesOrderResource.products.length) {
    const errorMsg = "One or more products do not exist.";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  const salesOrder = await SalesOrder.create({
    products: salesOrderResource.products.map((item) => {
      const product = existingProducts.find(
        (prod) => prod.barcode === item.barcode
      );
      return {
        barcode: item.barcode,
        price: product?.price,
        quantity: item.quantity,
      };
    }),
   
    saleDate: salesOrderResource.saleDate,
    source: "store",
  });

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

  // Überprüfen, ob alle Produkte existieren
  if (salesOrderResource.products) {
    const barcodes = salesOrderResource.products.map((product) => product.barcode);

    const products = await Product.find({ barcode: { $in: barcodes } });

    if (products.length !== salesOrderResource.products.length) {
      const missingBarcodes = barcodes.filter(
        (barcode) => !products.some((product) => product.barcode === barcode)
      );
      const errorMsg = `One or more products do not exist. Missing barcodes: ${missingBarcodes.join(", ")}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  const updateObject: {
    products?: {
      barcode: string;
      price: number;
      quantity: number;
    }[];
    saleDate?: Date;
    source?: string;
  } = {};

  if (salesOrderResource.products) {
    updateObject.products = salesOrderResource.products.map((item) => ({
      barcode: item.barcode,
      price: item.price,
      quantity: item.quantity,
    }));
  }

  if (salesOrderResource.saleDate) {
    updateObject.saleDate = new Date(salesOrderResource.saleDate);
  }

  
  await SalesOrder.updateOne({ _id: salesOrderResource.id }, updateObject);
  salesOrder = await SalesOrder.findById(salesOrderResource.id).exec();
  if (!salesOrder) {
    const errorMsg = "Sale order not found.";
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

export async function deleteSalesOrder(id: string): Promise<void> {
  const salesOrder = await SalesOrder.findById(id).exec();

  if (!salesOrder) {
    const errorMsg = "Sales order not found.";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
  await SalesOrder.deleteOne({ _id: id });
}
