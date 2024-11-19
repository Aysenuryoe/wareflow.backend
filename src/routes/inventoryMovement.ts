import express, { Request, Response, NextFunction } from "express";
import { body, matchedData, param, validationResult } from "express-validator";
import { InventoryMovementResource } from "../../src/Resources";
import {
  createInventoryMovement,
  deleteInventoryMovement,
  getAllInventoryMovements,
  getInventoryMovement,
  updateInventoryMovement,
} from "../../src/services/InventoryMovementService";
// import { authentication } from "../../src/routes/authentication";
// import { authorizeRole } from "../../src/middleware/roleMiddleware";

/*
authorize/authentication kommis aus & bei req.param ! entfernen
*/

const inventoryMovementRouter = express.Router();

inventoryMovementRouter.get(
  "/all",
  // authentication,
  // authorizeRole(["a", "u"]),
  async (req, res, next) => {
    try {
      const inventories = await getAllInventoryMovements();
      res.send(inventories);
    } catch (err) {
      next(err);
    }
  }
);

inventoryMovementRouter.get(
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
  body("products")
    .isArray()
    .notEmpty()
    .withMessage("Products must be a non-empty array.")
    .custom((products) => {
      if (products.length === 0) {
        throw new Error("Products must be a non-empty array.");
      }
      for (const product of products) {
        if (!product.barcode || typeof product.barcode !== "string") {
          throw new Error("Each product must have a unique barcode.");
        }
        if (!Number.isInteger(product.quantity) || product.quantity < 1) {
          throw new Error("Each product must have a valid quantity greater than 0.");
        }
      }
      return true;
    }),
  body("movementType")
    .isIn(["inbound", "outbound"])
    .withMessage("Movement type must be either 'inbound' or 'outbound'."),
  body("status")
    .isIn(["movement_placed", "pending", "completed", "canceled"])
    .withMessage("Status must be one of the predefined values."),
  // authentication,
  // authorizeRole(["a"]),
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
  body("products")
    .isArray()
    .notEmpty()
    .withMessage("Products must be a non-empty array.")
    .custom((products) => {
      if (products.length === 0) {
        throw new Error("Products must be a non-empty array.");
      }
      for (const product of products) {
        if (!product.barcode || typeof product.barcode !== "string") {
          throw new Error("Each product must have a valid barcode.");
        }
        if (!Number.isInteger(product.quantity) || product.quantity < 1) {
          throw new Error("Each product must have a valid quantity greater than 0.");
        }
      }
      return true;
    }),
  body("movementType").isIn(["inbound", "outbound"]),
  body("status").isIn(["movement_placed", "pending", "completed", "canceled"]),
  // authentication,
  // authorizeRole(["a"]),
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
  // authentication,
  // authorizeRole(["a"]),
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
