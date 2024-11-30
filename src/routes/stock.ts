import express, { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { updateStockBySKU } from "../services/StockService";

const stockRouter = express.Router();


const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

stockRouter.post(
  "/update",
  body("sku")
    .isString()
    .withMessage("SKU must be a valid string.")
    .isLength({ min: 6, max: 12 })
    .withMessage("SKU must be between 6 and 12 characters."),
  body("quantity")
    .isInt()
    .withMessage("Quantity must be an integer.")
    .custom((value) => {
      if (value === 0) {
        throw new Error("Quantity cannot be zero.");
      }
      return true;
    }),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sku, quantity } = req.body;
      const updatedProduct = await updateStockBySKU(sku, quantity);
      res.status(200).json({
        message: `Stock updated for SKU: ${sku}`,
        updatedStock: updatedProduct.stock,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default stockRouter;
