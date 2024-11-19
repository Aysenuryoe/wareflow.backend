import { model, Schema, Types } from "mongoose";

export interface IInventoryMovement {
  products: {
    barcode: string;          
    quantity: number;           
  }[];
  movementType: "inbound" | "outbound";
  date: Date;
  status: "movement_placed" | "pending" | "completed" | "canceled";
  remarks?: string;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>({
  products: [{
    barcode: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 }, 
  }],
  movementType: {
    type: String,
    enum: ["inbound", "outbound"],
    required: true,
  },
  date: { type: Date, required: true, default: Date.now }, 
  status: {
    type: String,
    enum: ["movement_placed", "pending", "completed", "canceled"],
    default: "pending", 
    required: true,
  },
  remarks: { type: String },
});

export const InventoryMovement = model<IInventoryMovement>("InventoryMovement", InventoryMovementSchema);
