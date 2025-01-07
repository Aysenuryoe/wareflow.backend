import mongoose, { Schema, Types, model } from "mongoose";

export interface IComplaint {
  referenceType: "GoodsReceipt" | "Sales";
  products: {
    productId: Types.ObjectId;
    quantity: number;
    reason: string;
  }[];
  status: "Open" | "Resolved";
}

const ComplaintSchema = new Schema<IComplaint>({
  referenceType: {
    type: String,
    enum: ["GoodsReceipt", "Sales"],
    required: true,
  },
  products: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true, min: 1 },
      reason: { type: String, required: true },
    },
  ],
  status: { type: String, enum: ["Open", "Resolved"], default: "Open" },
});

export const Complaint = model<IComplaint>("Complaint", ComplaintSchema);
