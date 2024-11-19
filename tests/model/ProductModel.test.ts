import DB from "tests/DB";
import { Product } from "../../src/models/ProductModel";

beforeAll(async () => await DB.connect());
// beforeEach(async () => await DB.syncIndexes());
afterEach(async () => await DB.clear());
afterAll(async () => await DB.close());


test("successful saving of product", async() => {
  const product = new Product({
    article: "Jacket",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 7,
    description: "Jacket with hoodie",
  })

  const res = await product.save();
  expect(res.article).toBe(product.article);
  expect(res.barcode).toBe(product.barcode);
  expect(res.price).toBe(24.99);
  expect(res.description).toBe( "Jacket with hoodie");
  
});



test("multiple products with same producNum and unique barcode", async () => {
  const jeansM = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 7,
    description: "Blue jeans",
  });

  const jeansL = new Product({
    article: "Jeans",
    size: "L",
    barcode: "859394",
    productNum: "1233874659",
    price: 24.99,
    stock: 5,
    description: "Blue jeans",
  });

  const dressXL = new Product({
    article: "Dress",
    size: "XL",
    barcode: "867391",
    productNum: "1343923780",
    price: 24.99,
    stock: 4,
    description: "Summer dress",
  });

  const dressM = new Product({
    article: "Dress",
    size: "M",
    barcode: "048364",
    productNum: "1343923780",
    price: 24.99,
    stock: 2,
    description: "Summer dress",
  });

  await jeansM.save();
  await jeansL.save();
  await dressM.save();
  await dressXL.save();

  expect(jeansM.barcode).toBeDefined();
  expect(jeansL.barcode).toBeDefined();
  expect(dressM.barcode).toBeDefined();
  expect(dressXL.barcode).toBeDefined();
  expect(jeansM.barcode).not.toEqual(jeansL.barcode); // M und L sollten unterschiedliche Barcodes haben
  expect(dressM.barcode).not.toEqual(dressXL.barcode); // S und XL sollten unterschiedliche Barcodes haben

});

test("should throw error when barcode is not unique", async () => {
  const product1 = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 7,
    description: "Blue jeans",
  });

  const product2 = new Product({
    article: "Jeans",
    size: "L",
    barcode: "001938", 
    productNum: "1233874659",
    price: 24.99,
    stock: 5,
    description: "Blue jeans",
  });

  await product1.save();

  await expect(product2.save()).rejects.toThrowError();
});

test("should throw error when size is invalid", async () => {
  const product = new Product({
    article: "Jeans",
    size: "XXL", 
    barcode: "001938",
    productNum: "1233874659",
    price: 24.99,
    stock: 7,
    description: "Blue jeans",
  });

  await expect(product.save()).rejects.toThrowError();
});

test("should throw error when productNum is missing", async () => {
  const product = new Product({
    article: "Jeans",
    size: "M",
    barcode: "001938",
    price: 24.99,
    stock: 7,
    description: "Blue jeans",
  });

  await expect(product.save()).rejects.toThrowError();
});