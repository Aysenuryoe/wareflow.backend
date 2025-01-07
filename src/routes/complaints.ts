import express, { Request, Response, NextFunction } from "express";
import { body, param, validationResult, matchedData } from "express-validator";
import {
  createComplaint,
  deleteComplaint,
  getAllComplaints,
  getComplaint,
  updateComplaint,
} from "../services/ComplaintsService";
import { ComplaintsResource } from "../../src/Resources";

const complaintRouter = express.Router();

complaintRouter.get("/all", async (req, res, next) => {
  try {
    const complaints = await getAllComplaints();
    res.json(complaints);
  } catch (err) {
    if (err instanceof Error) {
      res.status(404).send({ error: err.message });
      next(err);
    }
  }
});

complaintRouter.get(
  "/:id",
  param("id").isMongoId(),
  async (req: Request, res: Response, next: NextFunction) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const complaint = await getComplaint(req.params.id);
      res.json(complaint);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

complaintRouter.post(
  "/",
  body("referenceType").isIn(["GoodsReceipt", "Sales"]),
  body("products").isArray(),
  body("status").isIn(["Open", "Resolved"]),
  async (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const complaintData = matchedData(req) as ComplaintsResource;
      const newComplaint = await createComplaint(complaintData);
      res.status(201).json(newComplaint);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

complaintRouter.put(
  "/:id",
  param("id").isMongoId().withMessage("Invalid ID format."),
  body("referenceType").optional().isIn(["GoodsReceipt", "Sales"]),
  body("products").isArray(),
  body("status").optional().isIn(["Open", "Resolved"]),
  async (req: Request, res: Response, next: NextFunction) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const complaintResource: ComplaintsResource = {
        id: req.params.id,
        ...req.body,
      };
      const updatedComplaint = await updateComplaint(complaintResource);
      res.json(updatedComplaint);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

complaintRouter.delete(
  "/:id",
  param("id").isMongoId().withMessage("Invalid ID format."),
  async (req: Request, res: Response, next: NextFunction) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      await deleteComplaint(req.params.id);
      res.status(204).end();
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

export default complaintRouter;
