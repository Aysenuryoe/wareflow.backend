import mongoose, { Schema, model } from "mongoose";

export interface IComplaint {
  referenceId: mongoose.Types.ObjectId;
  referenceType: "GoodsReceipt" | "Sales";
  reason: string;
  quantity: number;
  status: "Open" | "Resolved";
}

const ComplaintSchema = new Schema<IComplaint>({
  referenceId: { type: Schema.Types.ObjectId, required: true },
  referenceType: {
    type: String,
    enum: ["GoodsReceipt", "PurchaseOrder"],
    required: true,
  }, 
  reason: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ["Open", "Resolved"], default: "Open" },
});

export const Complaint = model<IComplaint>("Complaint", ComplaintSchema);
