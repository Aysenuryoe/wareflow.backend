import express from "express";
import "express-async-errors";
import loginRouter from "./routes/login";
import productRouter from "./routes/product";
import inventoryMovementRouter from "./routes/inventoryMovement";
import userRouter from "./routes/user";
import cookieParser from "cookie-parser";
import salesRouter from "./routes/salesorder";
import purchaseRouter from "./routes/purchaseorder";
import stockRouter from "./routes/stock";
import cors from "cors";

const app = express();

app.use(cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true
}));


app.use(express.json())
app.use(cookieParser())

// Routes
app.use("/api/login", loginRouter);
app.use("/api/product", productRouter);
app.use("/api/sales", salesRouter);
app.use("/api/purchase", purchaseRouter);
app.use("/api/inventory", inventoryMovementRouter);
app.use("/api/user", userRouter);
app.use("/api/stock", stockRouter);

export default app;
