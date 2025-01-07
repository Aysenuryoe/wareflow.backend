import express from "express";
import { body, param, validationResult, matchedData } from "express-validator";
import {
  createReturn,
  deleteReturn,
  getAllReturns,
  getReturn,
  updateReturn,
} from "../services/ReturnService";
import { ReturnResource } from "../../src/Resources";

const returnRouter = express.Router();

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
  async (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const returnEntry = await getReturn(req.params!.id);
      res.json(returnEntry);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

returnRouter.post(
  "/",
  body("products").isArray({ min: 1 }),
  body("status").isIn(["Pending", "Completed"]),

  async (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const returnData = matchedData(req) as ReturnResource;
      const newReturn = await createReturn(returnData);
      res.status(201).json(newReturn);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

returnRouter.put(
  "/:id",
  param("id").isMongoId().withMessage("Invalid ID format."),
  body("products").isArray({ min: 1 }),
  body("status").isIn(["Pending", "Completed"]),
  async (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const returnResource: ReturnResource = {
        id: req.params!.id,
        ...req.body,
      };
      const updatedReturn = await updateReturn(returnResource);
      res.json(updatedReturn);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

returnRouter.delete(
  "/:id",
  param("id").isMongoId().withMessage("Invalid ID format."),
  async (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const id = req.params!.id;
      await deleteReturn(id);
      res.status(204).end();
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

export default returnRouter;
