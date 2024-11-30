import mongoose, { model, Schema, Types } from "mongoose";


export interface IReturn  {
    salesId: Types.ObjectId;
    products: {
        productId: Types.ObjectId;
        quantity: number;
        reason: string;
      }[];
      
    status: string;
    createdAt: Date

}

const ReturnSchema = new Schema<IReturn>({
    salesId: { type: Schema.Types.ObjectId, ref: "SalesOrder", required: true },
    products: [
        {
          productId: { type: Schema.Types.ObjectId, ref: "Product", required: true }, 
          quantity: { type: Number, required: true, min: 1 }, 
          reason: { type: String, required: true }, 
        },
      ], 
    status: { type: String, enum: ["Pending", "Completed"], default: "Pending" }, 
    createdAt: { type: Date, default: Date.now },
  });
  
export const Return = model<IReturn>("Return", ReturnSchema);
