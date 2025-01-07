import express, { Request, Response, NextFunction } from "express";
import { body, param, validationResult, matchedData } from "express-validator";
import {
  createGoodsReceipt,
  deleteGoodsReceipt,
  getAllGoodsReceipts,
  getGoodsReceipt,
  updateGoodsReceipt,
} from "../services/GoodsReceiptService";

const goodsReceiptRouter = express.Router();

goodsReceiptRouter.get("/all", async (req, res, next) => {
  try {
    const goodsreceipt = await getAllGoodsReceipts();
    res.send(goodsreceipt);
  } catch (err) {
    if (err instanceof Error) {
      res.status(404).send({ error: err.message });
      next(err);
    }
  }
});

goodsReceiptRouter.get(
  "/:id",
  param("id").isMongoId(),
  async (req: Request, res: Response, next: NextFunction) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const goods = await getGoodsReceipt(req.params.id);
      res.send(goods);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

goodsReceiptRouter.post(
  "/",
  body("purchaseOrderId")
    .isString()
    .isLength({ min: 24, max: 24 })
    .withMessage("PurchaseOrder ID must be a valid MongoDB ObjectId."),
  body("products").isArray(),
  body("receivedDate").isISO8601(),
  body("status").isIn(["Pending", "Completed", "Partial"]),
  body("remarks").optional().isString(),
  async (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const goodsData = req.body;
      const newGoodsReceipt = await createGoodsReceipt(goodsData);
      res.status(201).json(newGoodsReceipt);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
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
  body("products").isArray(),
  body("receivedDate").optional().isISO8601(),
  body("status").optional().isIn(["Pending", "Completed", "Partial"]),
  body("remarks").optional().isString(),
  async (req: Request, res: Response, next: NextFunction) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const goodsResource = {
        id: req.params.id,
        ...req.body,
      };
      const updateGoods = await updateGoodsReceipt(goodsResource);
      res.send(updateGoods);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

goodsReceiptRouter.delete(
  "/:id",
  param("id").isMongoId(),
  async (req: Request, res: Response, next: NextFunction) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const id = req.params.id;
      await deleteGoodsReceipt(id);
      res.status(204).end();
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

export default goodsReceiptRouter;
