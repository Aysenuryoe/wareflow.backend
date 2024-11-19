import { User } from "./models/UserModel";
import { createUser } from "./services/UserService";
import { createProduct, getAllProducts } from "./services/ProductService";
import { ProductResource, PurchaseOrderResource, SalesOrderResource } from "./Resources";
import { createSalesOrder } from "./services/SalesOrderService";
import { createPurchaseOrder } from "./services/PurchaseOrderService";

const email = "aysenurylr@gmail.com";
const strongPassword = "Helloworld123!";

export async function prefillDB() {
  console.log("Let's prefill the database with user Aysenur and the first products.");
  await User.syncIndexes();
  await createAdmin();
}

export async function createAdmin() {
  const user = await User.findOne({ email: email }); // 'await' hinzugefügt
  if (!user) {
    const userAysenur = await createUser({
      email: email,
      password: strongPassword,
      admin: true,
    });
    console.log(`Created user: ${userAysenur.email}`);
    await createProducts();
    await createSales();
    await createPurchases();
  } else {
    console.log("Data already created!");
  }
}

export async function createProducts(): Promise<void> {
  try {
    const sizes = ["XS", "S", "M", "L", "XL"];
    let baseBarcode = "03850";

    for (let i = 0; i < sizes.length; i++) {
      const product: ProductResource = {
        article: "Knitted pullover",
        barcode: baseBarcode + (i + 3).toString(),
        size: sizes[i],
        price: 24.99,
        productNum: "1239485011",
        stock: 5,
      };

      await createProduct(product);
      console.log(`Created product: ${product.article}, Size: ${product.size}, Barcode: ${product.barcode}`);
    }
    baseBarcode = "04760";

    for (let i = 0; i < sizes.length; i++) {
      const product: ProductResource = {
        article: "Bootcut Jeans",
        barcode: baseBarcode + (i + 3).toString(),
        size: sizes[i],
        price: 19.99,
        productNum: "1338492840",
        stock: 5,
      };

      await createProduct(product);
      console.log(`Created product: ${product.article}, Size: ${product.size}, Barcode: ${product.barcode}`);
    }

    const product: ProductResource = {
      article: "Cashmere Scarf",
      barcode: "048911",
      size: "NOSIZE",
      price: 49.99,
      productNum: "0012374859",
      stock: 5,
    };

    await createProduct(product);
    console.log(`Created product: ${product.article}, Size: ${product.size}, Barcode: ${product.barcode}`);

    console.log("Products successfully created.");
  } catch (error) {
    console.error("Error during database prefill:", error);
  }
}

export async function createSales(): Promise<void> {
  try {
    const sizes = ["XS", "S", "M", "L", "XL"];
    let baseBarcode = "05882";
    let product1 = await createProduct({
      article: "Sweatshirt",
      barcode: baseBarcode + "3",
      size: "M",
      price: 19.99,
      productNum: "1239485011",
      stock: 7,
    });

    baseBarcode = "03982";
    let product2 = await createProduct({
      article: "Longsleeve Shirt",
      barcode: baseBarcode + "3",
      size: "L",
      price: 7.99,
      productNum: "1158394190",
      stock: 12,
    });

    const salesResource: SalesOrderResource = {
      products: [
        { barcode: product1.barcode, price: product1.price, quantity: 2 },
        { barcode: product2.barcode, price: product2.price, quantity: 1 }
      ],
      saleDate: new Date(),
      source: "store"
    };

    await createSalesOrder(salesResource);
    console.log(`Created sales order with products: ${product1.barcode}, ${product2.barcode}`);
  } catch (error) {
    console.error("Error creating sales order:", error);
  }
}

export async function createPurchases(): Promise<void> {
  try {
    const product1 = await createProduct({
      article: "Sweatshirt",
      size: "S",
      barcode: "039284",
      price: 15.99,
      productNum: "1329306820",
      stock: 10,
    });

    const product2 = await createProduct({
      article: "Longsleeve Shirt",
      barcode: "031556",
      price: 7.99,
      size: "M",
      stock: 20,
      productNum: "1329306384"
    });
    
    const purchaseResource: PurchaseOrderResource = {
      products: [
        { barcode: product1.barcode, quantity: 3 },
        { barcode: product2.barcode, quantity: 2 },
      ],
      status: "Arrived",
      orderDate: new Date()
    };

    const product3 = await createProduct({
      article: "Winter Jacket",
      barcode: "099832",
      size: "L",
      price: 60.99,
      productNum: "1158224190",
      stock: 15,
    });

    const purchaseResource2: PurchaseOrderResource = {
      products: [
        { barcode: product3.barcode, quantity: 15 }
      ],
      status: "Pending",
      orderDate: new Date()
    };

    await createPurchaseOrder(purchaseResource);
    console.log(`Created purchase order with products: ${product1.barcode}, ${product2.barcode}`);

    await createPurchaseOrder(purchaseResource2);
    console.log(`Created purchase order with product: ${product3.barcode}`);
    
  } catch (error) {
    console.error("Error creating purchase order:", error);
  }
}
