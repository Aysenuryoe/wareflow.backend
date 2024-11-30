import { User } from "./models/UserModel";
import { createUser } from "./services/UserService";
import { createProduct } from "./services/ProductService";
import { createSaleOrder } from "./services/SalesOrderService";
import { createPurchaseOrder } from "./services/PurchaseOrderService";
import { Product } from "./models/ProductModel";
import { createReturn } from "./services/ReturnService";
import { createGoodsReceipt } from "./services/GoodsReceiptService";
import { createComplaint } from "./services/ComplaintsService";

const email = "aysenurylr@gmail.com";
const strongPassword = "Helloworld123!";

export async function prefillDB() {
  console.log("Let's prefill the database with user Aysenur and the first products.");
  await User.syncIndexes();
  await Product.syncIndexes();
  console.log("Indexes synchronized.");
  await createAdmin();
}

export async function createAdmin() {
  const user = await User.findOne({ email });
  if (!user) {
    const userAysenur = await createUser({
      email,
      password: strongPassword,
      admin: true,
    });
    console.log(`Created user: ${userAysenur.email}`);
    await createProducts();
    await createSales();
    await createPurchases();
    await createGoodsReceipts();
    await createReturns();
    await createComplaints();
  } else {
    console.log("Data already created!");
  }
}

export async function createProducts(): Promise<void> {
  console.log("Creating sample products...");
  const products = [
    {
      name: "T-Shirt",
      size: "M",
      price: 19.99,
      color: "Blue",
      sku: "TSH123",
      stock: 100,
      minStock: 10,
      description: "A comfortable blue T-shirt.",
    },
    {
      name: "Jeans",
      size: "L",
      price: 49.99,
      color: "Black",
      sku: "JNS456",
      stock: 50,
      minStock: 5,
      description: "Stylish black jeans.",
    },
    {
      name: "Sneakers",
      size: "42",
      price: 79.99,
      color: "White",
      sku: "SNK789",
      stock: 30,
      minStock: 5,
      description: "Comfortable white sneakers.",
    },
  ];

  for (const product of products) {
    const createdProduct = await createProduct(product);
    console.log(`Created product: ${createdProduct.name} (${createdProduct.sku})`);
  }
}

export async function createSales(): Promise<void> {
  console.log("Creating sample sales...");
  const products = await Product.find();

  const salesOrders = [
    {
      products: [
        {
          productId: getProductIdBySku(products, "TSH123"),
          price: 19.99,
          quantity: 2,
        },
        {
          productId: getProductIdBySku(products, "JNS456"),
          price: 49.99,
          quantity: 1,
        },
      ],
      totalAmount: 89.97,
      createdAt: new Date("2024-01-01T10:00:00Z"),
    },
    {
      products: [
        {
          productId: getProductIdBySku(products, "SNK789"),
          price: 79.99,
          quantity: 1,
        },
      ],
      totalAmount: 79.99,
      createdAt: new Date("2024-02-15T15:30:00Z"),
    },
  ];

  for (const sale of salesOrders) {
    const createdSale = await createSaleOrder(sale);
    console.log(`Created sale with total amount: ${createdSale.totalAmount} at ${createdSale.createdAt}`);
  }
}

export async function createPurchases(): Promise<void> {
  console.log("Creating sample purchases...");
  const products = await Product.find();

  const purchaseOrders = [
    {
      products: [
        {
          productId: getProductIdBySku(products, "TSH123"),
          quantity: 50,
        },
        {
          productId: getProductIdBySku(products, "JNS456"),
          quantity: 20,
        },
      ],
      supplier: "Fashion Supplier Inc.",
      status: "Ordered" as "Ordered",
      orderDate: new Date(),
    },
    {
      products: [
        {
          productId: getProductIdBySku(products, "SNK789"),
          quantity: 15,
        },
      ],
      supplier: "Sneaker World Ltd.",
      status: "Ordered" as "Ordered",
      orderDate: new Date(),
    },
  ];

  for (const purchase of purchaseOrders) {
    const createdPurchase = await createPurchaseOrder(purchase);
    console.log(`Created purchase order from supplier: ${purchase.supplier}`);
  }
}

export async function createGoodsReceipts(): Promise<void> {
  console.log("Creating sample goods receipts...");
  const products = await Product.find();

  const goodsReceipts = [
    {
      purchaseOrderId: "63e1d9f83f7e3c5a2b2d7d5a",
      products: [
        {
          productId: getProductIdBySku(products, "TSH123"),
          receivedQuantity: 45,
          discrepancies: "Missing 5 units",
        },
      ],
      receivedDate: new Date(),
      status: "Partial" as "Partial",
      remarks: "Delivery incomplete.",
    },
    {
      purchaseOrderId: "63e1d9f83f7e3c5a2b2d7d5b", 
      products: [
        {
          productId: getProductIdBySku(products, "SNK789"),
          receivedQuantity: 15,
        },
      ],
      receivedDate: new Date(),
      status: "Completed" as "Completed",
    },
  ];

  for (const receipt of goodsReceipts) {
    const createdReceipt = await createGoodsReceipt(receipt);
    console.log(`Created goods receipt with status: ${createdReceipt.status}`);
  }
}

export async function createReturns(): Promise<void> {
  console.log("Creating sample returns...");
  const products = await Product.find();

  const returns = [
    {
      salesId: "63e1d9f83f7e3c5a2b2d7d5c", // Beispiel-ID
      products: [
        {
          productId: getProductIdBySku(products, "TSH123"),
          quantity: 1,
          reason: "Wrong size",
        },
      ],
      status: "Pending",
      createdAt: new Date(),
    },
  ];

  for (const returnEntry of returns) {
    const createdReturn = await createReturn(returnEntry);
    console.log(`Created return with status: ${createdReturn.status}`);
  }
}

export async function createComplaints(): Promise<void> {
  console.log("Creating sample complaints...");
  const complaints = [
    {
      referenceId: "63e1d9f83f7e3c5a2b2d7d5d", 
      referenceType: "GoodsReceipt" as "GoodsReceipt",
      reason: "Damaged items",
      quantity: 3,
      status: "Open" as "Open"
    },
    {
      referenceId: "63e1d9f83f7e3c5a2b2d7d5e", 
      referenceType: "Sales" as "Sales",
      reason: "Item not as described",
      quantity: 1,
      status: "Open" as "Open",
    },
  ];

  for (const complaint of complaints) {
    const createdComplaint = await createComplaint(complaint);
    console.log(`Created complaint with reason: ${createdComplaint.reason}`);
  }
}

function getProductIdBySku(products: any[], sku: string): string {
  const product = products.find((p) => p.sku === sku);
  if (!product) {
    throw new Error(`Product with SKU ${sku} not found.`);
  }
  return product._id.toString();
}
