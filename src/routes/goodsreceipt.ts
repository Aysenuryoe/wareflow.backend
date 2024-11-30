import express, { Request, Response, NextFunction } from "express";
import { body, param, validationResult, matchedData } from "express-validator";
import {
  createGoodsReceipt,
  deleteGoodsReceipt,
  getAllGoodsReceipts,
  getGoodsReceipt,
  updateGoodsReceipt,
} from "../../src/services/GoodsReceiptService";
import { GoodsReceiptResource } from "../../src/Resources";

const goodsReceiptRouter = express.Router();

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
      if (
        !Number.isInteger(product.receivedQuantity) ||
        product.receivedQuantity < 1
      ) {
        throw new Error(
          "Each product must have a valid receivedQuantity greater than 0."
        );
      }
    }
    return true;
  });

goodsReceiptRouter.get("/all", async (req, res, next) => {
  try {
    const goodsReceipts = await getAllGoodsReceipts();
    res.json(goodsReceipts);
  } catch (err) {
    next(err);
  }
});

goodsReceiptRouter.get(
  "/:id",
  param("id").isMongoId(),
  validateRequest,
  async (req, res, next) => {
    try {
      const goodsReceipt = await getGoodsReceipt(req.params.id);
      res.json(goodsReceipt);
    } catch (err) {
      next(err);
    }
  }
);

goodsReceiptRouter.post(
  "/",
  body("purchaseOrderId")
    .isString()
    .isLength({ min: 24, max: 24 })
    .withMessage("PurchaseOrder ID must be a valid MongoDB ObjectId."),
  validateProducts,
  body("receivedDate").isISO8601(),
  body("status").isIn(["Pending", "Completed", "Partial"]),
  body("remarks").optional().isString(),
  validateRequest,
  async (req, res, next) => {
    try {
      const goodsReceiptData = matchedData(req) as GoodsReceiptResource;
      const newGoodsReceipt = await createGoodsReceipt(goodsReceiptData);
      res.status(201).json(newGoodsReceipt);
    } catch (err) {
      next(err);
    }
  }
);

goodsReceiptRouter.put(
  "/:id",
  param("id").isMongoId(),
  body("purchaseOrderId")
    .optional()
    .isString()
    .isLength({ min: 24, max: 24 })
    .withMessage("PurchaseOrder ID must be a valid MongoDB ObjectId."),
  validateProducts.optional(),
  body("receivedDate").optional().isISO8601(),
  body("status").optional().isIn(["Pending", "Completed", "Partial"]),
  body("remarks").optional().isString(),
  validateRequest,
  async (req, res, next) => {
    try {
      const goodsReceiptResource: GoodsReceiptResource = {
        id: req.params.id,
        ...req.body,
      };
      const updatedGoodsReceipt = await updateGoodsReceipt(
        goodsReceiptResource
      );
      res.json(updatedGoodsReceipt);
    } catch (err) {
      next(err);
    }
  }
);

goodsReceiptRouter.delete(
  "/:id",
  param("id").isMongoId(),
  validateRequest,
  async (req, res, next) => {
    try {
      await deleteGoodsReceipt(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
);

export default goodsReceiptRouter;
