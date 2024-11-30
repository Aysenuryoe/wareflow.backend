import express, { Request, Response, NextFunction } from "express";
import { body, param, validationResult, matchedData } from "express-validator";
import {
  createReturn,
  deleteReturn,
  getAllReturns,
  getReturn,
  updateReturn,
} from "../../src/services/ReturnService";
import { ReturnResource } from "../../src/Resources";

const returnRouter = express.Router();

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateProducts = body("products")
  .isArray({ min: 1 })
  .withMessage("Products must be a non-empty array.")
  .custom((products) => {
    for (const product of products) {
      if (!product.productId || typeof product.productId !== "string") {
        throw new Error("Each product must have a valid product ID.");
      }
      if (!Number.isInteger(product.quantity) || product.quantity < 1) {
        throw new Error(
          "Each product must have a valid quantity greater than 0."
        );
      }
      if (
        !product.reason ||
        typeof product.reason !== "string" ||
        product.reason.length < 5
      ) {
        throw new Error(
          "Each product must have a valid reason (minimum 5 characters)."
        );
      }
    }
    return true;
  });

returnRouter.get("/all", async (req, res, next) => {
  try {
    const returns = await getAllReturns();
    res.json(returns);
  } catch (err) {
    next(err);
  }
});

returnRouter.get(
  "/:id",
  param("id").isMongoId().withMessage("Invalid ID format."),
  validateRequest,
  async (req, res, next) => {
    try {
      const returnEntry = await getReturn(req.params.id);
      res.json(returnEntry);
    } catch (err) {
      next(err);
    }
  }
);

returnRouter.post(
  "/",
  body("salesId").isString().isLength({ min: 24, max: 24 }),
  validateProducts,
  body("status").isIn(["Pending", "Completed"]),
  validateRequest,
  async (req, res, next) => {
    try {
      const returnData = matchedData(req) as ReturnResource;
      const newReturn = await createReturn(returnData);
      res.status(201).json(newReturn);
    } catch (err) {
      next(err);
    }
  }
);

returnRouter.put(
  "/:id",
  param("id").isMongoId().withMessage("Invalid ID format."),
  body("salesId").optional().isString().isLength({ min: 24, max: 24 }),
  validateProducts.optional(),
  body("status").optional().isIn(["Pending", "Completed"]),
  validateRequest,
  async (req, res, next) => {
    try {
      const returnResource: ReturnResource = {
        id: req.params.id,
        ...req.body,
      };
      const updatedReturn = await updateReturn(returnResource);
      res.json(updatedReturn);
    } catch (err) {
      next(err);
    }
  }
);

returnRouter.delete(
  "/:id",
  param("id").isMongoId().withMessage("Invalid ID format."),
  validateRequest,
  async (req, res, next) => {
    try {
      await deleteReturn(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
);

export default returnRouter;
