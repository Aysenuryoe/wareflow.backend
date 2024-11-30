import express, { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";

// import { authentication } from "../../src/routes/authentication";
// import { authorizeRole } from "../../src/middleware/roleMiddleware";
import {
  createSaleOrder,
  deleteSalesOrder,
  getAllSales,
  getSaleOrder,
  updateSale,
} from "../services/SalesOrderService";

const salesRouter = express.Router();

salesRouter.get(
  "/all",
  // authentication,
  // authorizeRole(["a", "u"]),
  async (req, res, next) => {
    try {
      const salesOrders = await getAllSales();
      res.send(salesOrders);
    } catch (err) {
      next(err);
    }
  }
);

salesRouter.get(
  "/:id",
  param("id").isMongoId(),
  // authentication,
  // authorizeRole(["a", "u"]),
  async (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const salesOrder = await getSaleOrder(req.params!.id);
      res.send(salesOrder);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

salesRouter.post(
  "/",
  body("products")
    .isArray({ min: 1 })
    .withMessage("Products must be a non-empty array.")
    .custom((products) => {
      for (const product of products) {
        if (!product.productId || typeof product.productId !== "string") {
          throw new Error("Each product must have a valid SKU.");
        }
        if (typeof product.price !== "number" || product.price < 1) {
          throw new Error(
            "Each product must have a valid price greater than or equal to 1."
          );
        }
        if (!Number.isInteger(product.quantity) || product.quantity < 1) {
          throw new Error(
            "Each product must have a valid quantity greater than 0."
          );
        }
      }
      return true;
    }),
  body("totalAmount").isFloat(),
  body("createdAt").isISO8601(),
  // authentication,
  // authorizeRole(["a"]),
  async (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const salesOrderData = req.body;
      const newSalesOrder = await createSaleOrder(salesOrderData);
      res.status(201).json(newSalesOrder);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

salesRouter.put(
  "/:id",
  param("id").isMongoId(),
  body("products")
    .isArray({ min: 1 })
    .withMessage("Products must be a non-empty array.")
    .custom((products) => {
      for (const product of products) {
        if (!product.productId || typeof product.productId !== "string") {
          throw new Error("Each product must have a valid SKU.");
        }
        if (typeof product.price !== "number" || product.price < 1) {
          throw new Error(
            "Each product must have a valid price greater than or equal to 1."
          );
        }
        if (!Number.isInteger(product.quantity) || product.quantity < 1) {
          throw new Error(
            "Each product must have a valid quantity greater than 0."
          );
        }
      }
      return true;
    }),
  body("totalAmount").isFloat(),
  body("createdAt").isISO8601(),
  // authentication,
  // authorizeRole(["a"]),
  async (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const salesOrderResource = {
        id: req.params!.id,
        ...req.body,
      };
      const updatedSalesOrder = await updateSale(salesOrderResource);
      res.send(updatedSalesOrder);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

salesRouter.delete(
  "/:id",
  param("id").isMongoId(),
  // authentication,
  // authorizeRole(["a"]),
  async (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const id = req.params!.id;
      const salesOrder = await getSaleOrder(id);

      await deleteSalesOrder(id);
      res.status(204).end();
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

export default salesRouter;
