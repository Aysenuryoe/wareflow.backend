export type ProductResource = {
  id?: string;
  name: string;
  size: string;
  price: number;
  color: string;
  sku?: string;
  stock: number;
  minStock?: number;
  description?: string;
};

export type PurchaseOrderResource = {
  id?: string;
  products: {
    productId: string;
    size: string;
    quantity: number;
  }[];
  supplier: string;
  status: "Ordered" | "Pending" | "Arrived" | "Cancelled";
  orderDate: Date;
  receivedDate?: Date;
};

export type SalesOrderResource = {
  id?: string;
  products: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  createdAt: Date;
};

export type InventoryMovementResource = {
  id?: string;
  productId: string;
  name: string;
  type: "Inbound" | "Outbound" | "Return" | "Adjustment";
  quantity: number;
  date: Date;
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

export type ReturnResource = {
  id?: string;
  products: {
    productId: string;
    name: string;
    quantity: number;
    reason: string;
  }[];

  status: string;
  createdAt?: Date;
};

export type GoodsReceiptResource = {
  id?: string;
  purchaseOrderId: string;
  products: {
    productId: string;
    name: string;
    size: string;
    receivedQuantity: number;
    discrepancies?: string;
  }[];
  receivedDate: Date;
  status: "Pending" | "Completed" | "Partial";
  remarks?: string;
};

export type ComplaintsResource = {
  id?: string;
  referenceType: "GoodsReceipt" | "Sales" | "PurchaseOrder";
  products: {
    productId: string;
    quantity: number;
    reason: string;
  }[];
  status: "Open" | "Resolved";
};
