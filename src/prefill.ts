import { User } from "./models/UserModel";
import { createUser } from "./services/UserService";
import { createProduct } from "./services/ProductService";
import { createSaleOrder } from "./services/SalesOrderService";

import { Product } from "./models/ProductModel";

import { ProductResource } from "./Resources";

const email = "aysenurylr@gmail.com";
const strongPassword = "Helloworld123!";

export async function prefillDB() {
  console.log(
    "Let's prefill the database with user Aysenur and the first products."
  );
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
  } else {
    console.log("Data already created!");
  }
}

export async function createProducts(): Promise<void> {
  console.log("Creating sample products with appropriate sizes...");

  const clothingSizes = ["XS", "S", "M", "L", "XL"];
  const shoeSizes = ["37", "38", "39", "40", "41", "42", "43", "44"];

  const clothingProducts = [
    {
      name: "T-Shirt",
      price: 19.99,
      color: ["Blue"],
      sku: "TSH123",
      stock: 20,
      minStock: 10,
      description: "A comfortable blue T-shirt.",
    },
    {
      name: "Jeans",
      price: 49.99,
      color: ["Black"],
      sku: "JNS456",
      stock: 20,
      minStock: 5,
      description: "Stylish black jeans.",
    },
  ];

  const shoeProducts = [
    {
      name: "Sneakers",
      price: 79.99,
      color: ["White"],
      sku: "SNK789",
      stock: 15,
      minStock: 5,
      description: "Comfortable white sneakers.",
    },
  ];

  for (const product of clothingProducts) {
    for (const size of clothingSizes) {
      const newProduct = {
        ...product,
        size,
        sku: `${product.sku}-${size}`,
        color: product.color[0],
      };

      const createdProduct = await createProduct(newProduct);
      console.log(
        `Created clothing product: ${createdProduct.name} (${createdProduct.sku}) in size ${size}`
      );
    }
  }

  for (const product of shoeProducts) {
    for (const size of shoeSizes) {
      const newProduct = {
        ...product,
        size,
        sku: `${product.sku}-${size}`,
        color: product.color[0],
      };

      const createdProduct = await createProduct(newProduct);
      console.log(
        `Created shoe product: ${createdProduct.name} (${createdProduct.sku}) in size ${size}`
      );
    }
  }
}

export async function createSales(): Promise<void> {
  console.log("Creating sample sales...");

  const newProductRes: ProductResource = {
    name: "Earrings",
    size: "NOSIZE",
    price: 29.99,
    color: "Silver",
    sku: "EARR123",
    stock: 10,
    minStock: 5,
    description: "Elegant silver earrings.",
  };

  const newProduct = await createProduct(newProductRes);

  const newProduct2Res: ProductResource = {
    name: "Beanie",
    size: "NOSIZE",
    price: 19.99,
    color: "Black",
    sku: "BEAN456",
    stock: 15,
    minStock: 10,
    description: "Wool black beanie",
  };

  const newProduct2 = await createProduct(newProduct2Res);

  console.log("Creating sales orders...");

  const saleOrder1 = await createSaleOrder({
    products: [
      {
        productId: newProduct.id!.toString(),
        name: newProduct.name,
        price: newProduct.price,
        quantity: 2,
      },
    ],
    totalAmount: newProduct.price * 2,
    createdAt: new Date("2024-01-10T10:00:00Z"),
  });

  console.log(
    `Created sale order for Earrings. Total Amount: ${saleOrder1.totalAmount}`
  );

  const saleOrder2 = await createSaleOrder({
    products: [
      {
        productId: newProduct2.id!.toString(),
        name: newProduct2.name,
        price: newProduct2.price,
        quantity: 1,
      },
    ],
    totalAmount: newProduct2.price * 1,
    createdAt: new Date("2024-01-15T15:30:00Z"),
  });

  console.log(
    `Created sale order for Beanie. Total Amount: ${saleOrder2.totalAmount}`
  );

  console.log("Sales orders created successfully.");
}
