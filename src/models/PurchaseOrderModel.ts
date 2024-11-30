import mongoose, { model, Schema, Types } from "mongoose";

export interface IPurchaseOrder {
  products: {
    productId: string;
    quantity: number;
  }[];
  supplier: string;
  status: "Ordered" | "Pending" | "Arrived" | "Cancelled";
  orderDate: Date;
  receivedDate: Date;
}

export const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    products: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],

    status: {
      type: String,
      required: true,
      enum: ["Ordered", "Pending", "Arrived", "Cancelled"],
      default: "Ordered"
    },
    orderDate: { type: Date, default: Date.now },
    receivedDate: { type: Date, required: true },
  },
  { timestamps: true }
);

/*
wenn der receivedDate gesetztt wird soll der Satus
auf Arrived aktualisiert werden
wenn orderDate gesetzt ist dann Status 
auf Pending setzen
*/
PurchaseOrderSchema.pre("save", function (next) {
  if (this.receivedDate) {
    this.status = "Arrived";
  } else if (!this.receivedDate && this.orderDate) {
    this.status = "Pending";
  }
  next();
});

export const PurchaseOrder = model<IPurchaseOrder>(
  "PurchaseOrder",
  PurchaseOrderSchema
);
