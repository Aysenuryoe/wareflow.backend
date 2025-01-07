import express from "express";
import { body, param, validationResult } from "express-validator";
import {
  createSaleOrder,
  deleteSalesOrder,
  getAllSales,
  getSaleOrder,
  updateSale,
} from "../services/SalesOrderService";

const salesRouter = express.Router();

salesRouter.get("/all", async (req, res, next) => {
  try {
    const salesOrders = await getAllSales();
    res.send(salesOrders);
  } catch (err) {
    next(err);
  }
});

salesRouter.get("/:id", param("id").isMongoId(), async (req, res, next) => {
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
});

salesRouter.post(
  "/",
  body("products")
    .isArray({ min: 1 })
    .withMessage("Products must be a non-empty array."),
  body("totalAmount"),
  body("createdAt").optional(),
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
    .withMessage("Products must be a non-empty array."),
  body("totalAmount"),
  body("createdAt").optional(),
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

salesRouter.delete("/:id", param("id").isMongoId(), async (req, res, next) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(400).json({ errors: err.array() });
  }
  try {
    const id = req.params!.id;

    await deleteSalesOrder(id);
    res.status(204).end();
  } catch (err) {
    if (err instanceof Error) {
      res.status(404).send({ error: err.message });
      next(err);
    }
  }
});

export default salesRouter;
