import express, { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import {
  createPurchaseOrder,
  deletePurchase,
  getAllPurchaseOrders,
  getPurchaseOrder,
  updatePurchaseOrder,
} from "../services/PurchaseOrderService";

const purchaseRouter = express.Router();

purchaseRouter.get(
  "/all",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const purchaseOrders = await getAllPurchaseOrders();
      res.send(purchaseOrders);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

purchaseRouter.get(
  "/:id",
  param("id").isMongoId(),
  async (req: Request, res: Response, next: NextFunction) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const purchaseOrder = await getPurchaseOrder(req.params.id);
      res.send(purchaseOrder);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

purchaseRouter.post(
  "/",
  body("products")
    .isArray()
    .notEmpty()
    .withMessage("Products must be a non-empty array.")
    .custom((products) => {
      if (products.length === 0) {
        throw new Error("Products must be a non-empty array.");
      }
      for (const product of products) {
        if (!product.productId || typeof product.productId !== "string") {
          throw new Error("Each product must have a unique product ID.");
        }
        if (!Number.isInteger(product.quantity) || product.quantity < 1) {
          throw new Error(
            "Each product must have a valid quantity greater than 0."
          );
        }
      }
      return true;
    }),

  body("supplier").isString(),
  body("status").isIn(["Ordered", "Pending", "Arrived", "Cancelled"]),
  body("orderDate").isISO8601(),
  body("receivedDate").optional().isISO8601(),
  async (req: Request, res: Response, next: NextFunction) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const purchaseOrderData = req.body;
      const newPurchaseOrder = await createPurchaseOrder(purchaseOrderData);
      res.status(201).json(newPurchaseOrder);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

purchaseRouter.put(
  "/:id",
  param("id").isMongoId(),
  body("products")
    .isArray()
    .notEmpty()
    .custom((products) => {
      if (products.length === 0) {
        throw new Error("Products must be a non-empty array.");
      }
      for (const product of products) {
        if (!product.productId || typeof product.productId !== "string") {
          throw new Error("Each product must have a unique product ID.");
        }
        if (!Number.isInteger(product.quantity) || product.quantity < 1) {
          throw new Error(
            "Each product must have a valid quantity greater than 0."
          );
        }
      }
      return true;
    }),

  body("supplier").isString(),
  body("status").isIn(["Ordered", "Pending", "Arrived", "Cancelled"]),
  body("orderDate").isISO8601(),
  body("receivedDate").optional().isISO8601(),
  async (req: Request, res: Response, next: NextFunction) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const purchaseOrderResource = {
        id: req.params.id,
        ...req.body,
      };
      const updatedPurchaseOrder = await updatePurchaseOrder(
        purchaseOrderResource
      );
      res.send(updatedPurchaseOrder);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

purchaseRouter.delete(
  "/:id",
  param("id").isMongoId(),
  async (req: Request, res: Response, next: NextFunction) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const id = req.params.id;
      await deletePurchase(id);
      res.status(204).end();
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

export default purchaseRouter;
