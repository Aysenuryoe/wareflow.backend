import express from "express";
import { body, matchedData, param, validationResult } from "express-validator";
import { InventoryMovementResource } from "../../src/Resources";
import {
  createInventoryMovement,
  deleteInventoryMovement,
  getAllInventoryMovements,
  getInventoryMovement,
  updateInventoryMovement,
} from "../services/InventoryMovementService";

const inventoryMovementRouter = express.Router();

inventoryMovementRouter.get("/all", async (req, res, next) => {
  try {
    const inventories = await getAllInventoryMovements();
    res.send(inventories);
  } catch (err) {
    next(err);
  }
});

inventoryMovementRouter.get(
  "/:id",
  param("id").isMongoId(),
  async (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const inventory = await getInventoryMovement(req.params!.id);
      res.send(inventory);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

inventoryMovementRouter.post(
  "/",
  body("productId").isString(),
  body("type").isString().isIn(["Inbound", "Outbound", "Return", "Adjustment"]),
  body("quantity").isFloat({ min: 1 }),
  body("date").isISO8601(),
  async (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const inventoryData = matchedData(req) as InventoryMovementResource;
      const newInventory = await createInventoryMovement(inventoryData);

      res.status(201).send(newInventory);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

inventoryMovementRouter.put(
  "/:id",
  param("id").isMongoId(),
  body("productId").isString(),
  body("type").isString().isIn(["Inbound", "Outbound", "Return", "Adjustment"]),
  body("quantity").isFloat({ min: 1 }),
  body("date").isISO8601(),
  async (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const inventoryResource: InventoryMovementResource = {
        id: req.params!.id,
        ...req.body,
      };
      const inventory = await updateInventoryMovement(inventoryResource);
      res.status(200).send(inventory);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

inventoryMovementRouter.delete(
  "/:id",
  param("id").isMongoId(),
  async (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const id = req.params!.id;
      await deleteInventoryMovement(id);
      res.status(204).end();
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

export default inventoryMovementRouter;
