import express from "express";
import { body, validationResult } from "express-validator";
import { increaseStock, decreaseStock } from "../services/StockService";

const stockRouter = express.Router();

stockRouter.post(
  "/increase",
  body("barcode").isNumeric(),
  body("quantity").isInt({ gt: 0 }),
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }

    const { barcode, quantity } = req.body;

    try {
      const updatedProduct = await increaseStock(barcode, quantity);
      res.status(200).json(updatedProduct);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).json({ error: err.message });
      }
    }
  }
);

stockRouter.post(
  "/decrease",
  body("barcode").isNumeric(),
  body("quantity").isInt({ gt: 0 }),
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }

    const { barcode, quantity } = req.body;

    try {
      const updatedProduct = await decreaseStock(barcode, quantity);
      res.status(200).json(updatedProduct);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).json({ error: err.message });
      }
    }
  }
);

export default stockRouter;
