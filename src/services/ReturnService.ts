import { Product } from "src/models/ProductModel";
import { Return } from "src/models/ReturnModel";
import { ReturnResource } from "src/Resources";

export async function getAllReturns(): Promise<ReturnResource[]> {
  const returns = await Return.find().exec();

  return returns.map((returnEntry) => ({
    id: returnEntry._id.toString(),
    salesId: returnEntry.salesId.toString(),
    products: returnEntry.products.map((item) => ({
      productId: item.productId.toString(),
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
    salesId: returnEntry.salesId.toString(),
    products: returnEntry.products.map((item) => ({
      productId: item.productId.toString(),
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
    salesId: returnResource.salesId,
    products: returnResource.products.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      reason: item.reason,
    })),
    status: "Pending",
    createdAt: new Date(),
  });

  for (const product of returnResource.products) {
    const productEntry = await Product.findById(product.productId);
    if (!productEntry) {
      throw new Error("Product not found.");
    }

    productEntry.stock += product.quantity;
    await productEntry.save();
  }

  return {
    id: returnEntry._id.toString(),
    salesId: returnEntry.salesId.toString(),
    products: returnEntry.products.map((item) => ({
      productId: item.productId.toString(),
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
        quantity: number;
        reason: string;
      }[];
      status: string;
      createdAt: Date;
    }> = {};

    if (returnResource.products) {
      updateObject.products = returnResource.products.map((item) => ({
        productId: item.productId,
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
      salesId: updatedReturn.salesId.toString(),
      products: updatedReturn.products.map((item) => ({
        productId: item.productId.toString(),
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
