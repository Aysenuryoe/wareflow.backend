import express from "express";
import "express-async-errors";
import loginRouter from "./routes/login";
import productRouter from "./routes/product";
import inventoryMovementRouter from "./routes/inventoryMovement";
import userRouter from "./routes/user";
import cookieParser from "cookie-parser";
import salesRouter from "./routes/salesorder";
import purchaseRouter from "./routes/purchaseorder";
import cors from "cors";
import complaintRouter from "./routes/complaints";
import goodsReceiptRouter from "./routes/goodsreceipt";
import returnRouter from "./routes/return";

const app = express();

app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/login", loginRouter);
app.use("/api/product", productRouter);
app.use("/api/sales", salesRouter);
app.use("/api/purchase", purchaseRouter);
app.use("/api/inventory", inventoryMovementRouter);
app.use("/api/user", userRouter);
app.use("/api/complaint", complaintRouter);
app.use("/api/goodsreceipt", goodsReceiptRouter);
app.use("/api/return", returnRouter);

export default app;
