export type ProductResource = {
  id?: string;
  article: string;
  barcode: string;
  size: string;
  price: number;
  productNum: string;
  stock: number;
  description?: string;
};

export type PurchaseOrderResource = {
  id?: string;
  products: {
    barcode: string;
    quantity: number;
  }[];

  status: "Ordered" | "Pending" | "Arrived" | "Cancelled";
  orderDate: Date;
  receivedDate?: Date;

};

export type SalesOrderResource = {
  id?: string;
  products: {
    barcode: string;
    price: number;
    quantity: number;
  }[];
 
  saleDate: Date;
  source: "store";
};

export type InventoryMovementResource = {
  id?: string;
  products: {
    barcode: string;
    quantity: number;
  }[];
  movementType: "inbound" | "outbound";
  date: Date;
  status: "movement_placed" | "pending" | "completed" | "canceled";
  remarks?: string;
};

export type UserResource = {
  id?: string;
  email: string;
  password?: string;
  admin: boolean;
};

export type UsersResource = {
  users: UserResource[];
};

export type LoginResource = {
  accessToken: string;
  tokenType: "Bearer";
};
