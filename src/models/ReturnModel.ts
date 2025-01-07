import { model, Schema, Types } from "mongoose";

export interface IReturn {
  products: {
    productId: Types.ObjectId;
    name: string;
    quantity: number;
    reason: string;
  }[];

  status: string;
  createdAt?: Date;
}

const ReturnSchema = new Schema<IReturn>({
  products: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: { type: String },
      quantity: { type: Number, required: true, min: 1 },
      reason: { type: String, required: true },
    },
  ],
  status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

export const Return = model<IReturn>("Return", ReturnSchema);
