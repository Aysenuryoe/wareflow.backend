import mongoose, { Schema, model, Types } from "mongoose";

export interface IInventoryMovement {
  productId: Types.ObjectId;
  type: "Inbound" | "Outbound" | "Return" | "Adjustment";
  quantity: number;
  date: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  type: {
    type: String,
    enum: ["Inbound", "Outbound", "Return", "Adjustment"], 
    required: true,
  },
  quantity: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

export const InventoryMovement = model<IInventoryMovement>(
  "InventoryMovement",
  InventoryMovementSchema
);
