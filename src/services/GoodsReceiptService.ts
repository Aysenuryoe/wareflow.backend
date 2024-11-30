import { GoodsReceipt } from "../../src/models/GoodsReceiptModel";
import { GoodsReceiptResource } from "../../src/Resources";


export async function getAllGoodsReceipts(): Promise<GoodsReceiptResource[]> {
  const goodsReceipts = await GoodsReceipt.find().exec();

  return goodsReceipts.map((receipt) => ({
    id: receipt._id.toString(),
    purchaseOrderId: receipt.purchaseOrderId.toString(),
    products: receipt.products.map((product) => ({
      productId: product.productId.toString(),
      receivedQuantity: product.receivedQuantity,
      discrepancies: product.discrepancies,
    })),
    receivedDate: receipt.receivedDate,
    status: receipt.status,
    remarks: receipt.remarks,
  }));
};

export async function getGoodsReceipt(id: string): Promise<GoodsReceiptResource> {
    const goodsReceipt = await GoodsReceipt.findById(id).populate("products.productId").exec();
  
    if (!goodsReceipt) {
      throw new Error("Goods receipt not found.");
    }
  
    return {
      id: goodsReceipt._id.toString(),
      purchaseOrderId: goodsReceipt.purchaseOrderId.toString(),
      products: goodsReceipt.products.map((product) => ({
        productId: product.productId.toString(),
        receivedQuantity: product.receivedQuantity,
        discrepancies: product.discrepancies,
      })),
      receivedDate: goodsReceipt.receivedDate,
      status: goodsReceipt.status,
      remarks: goodsReceipt.remarks,
    };
  }
  

  export async function createGoodsReceipt(goodsReceiptResource: GoodsReceiptResource): Promise<GoodsReceiptResource> {
    const goodsReceipt = await GoodsReceipt.create({
      purchaseOrderId: goodsReceiptResource.purchaseOrderId,
      products: goodsReceiptResource.products.map((product) => ({
        productId: product.productId,
        receivedQuantity: product.receivedQuantity,
        discrepancies: product.discrepancies,
      })),
      receivedDate: goodsReceiptResource.receivedDate || new Date(),
      status: goodsReceiptResource.status || "Pending",
      remarks: goodsReceiptResource.remarks,
    });
  
    return {
      id: goodsReceipt._id.toString(),
      purchaseOrderId: goodsReceipt.purchaseOrderId.toString(),
      products: goodsReceipt.products.map((product) => ({
        productId: product.productId.toString(),
        receivedQuantity: product.receivedQuantity,
        discrepancies: product.discrepancies,
      })),
      receivedDate: goodsReceipt.receivedDate,
      status: goodsReceipt.status,
      remarks: goodsReceipt.remarks,
    };
  }
  
  export async function updateGoodsReceipt(goodsReceiptResource: GoodsReceiptResource): Promise<GoodsReceiptResource> {
    let goodsReceipt = await GoodsReceipt.findById(goodsReceiptResource.id);
  
    if (!goodsReceipt) {
      throw new Error("Goods receipt not found.");
    }

    const updateObject: Partial<GoodsReceiptResource> = {};
    if (goodsReceiptResource.products) {
      updateObject.products = goodsReceiptResource.products.map((product) => ({
        productId: product.productId,
        receivedQuantity: product.receivedQuantity,
        discrepancies: product.discrepancies,
      }));
    }
    if (goodsReceiptResource.receivedDate) {
      updateObject.receivedDate = goodsReceiptResource.receivedDate;
    }
    if (goodsReceiptResource.status) {
      updateObject.status = goodsReceiptResource.status;
    }
    if (goodsReceiptResource.remarks) {
      updateObject.remarks = goodsReceiptResource.remarks;
    }
  

    await GoodsReceipt.updateOne({ _id: goodsReceiptResource.id }, updateObject);
  

    goodsReceipt = await GoodsReceipt.findById(goodsReceiptResource.id).exec();
    return {
      id: goodsReceipt!._id.toString(),
      purchaseOrderId: goodsReceipt!.purchaseOrderId.toString(),
      products: goodsReceipt!.products.map((product) => ({
        productId: product.productId.toString(),
        receivedQuantity: product.receivedQuantity,
        discrepancies: product.discrepancies,
      })),
      receivedDate: goodsReceipt!.receivedDate,
      status: goodsReceipt!.status,
      remarks: goodsReceipt!.remarks,
    };
  }
  

  export async function deleteGoodsReceipt(id: string): Promise<void> {
    const goodsReceipt = await GoodsReceipt.findById(id);
    if (!goodsReceipt) {
      throw new Error("Goods receipt not found.");
    }
    await GoodsReceipt.deleteOne({ _id: id });
  }
  