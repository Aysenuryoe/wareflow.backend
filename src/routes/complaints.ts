import express, { Request, Response, NextFunction } from "express";
import { body, param, validationResult, matchedData } from "express-validator";
import {
  createComplaint,
  deleteComplaint,
  getAllComplaints,
  getComplaint,
  updateComplaint,
} from "../../src/services/ComplaintsService";
import { ComplaintsResource } from "../../src/Resources";

const complaintRouter = express.Router();

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

complaintRouter.get("/all", async (req, res, next) => {
  try {
    const complaints = await getAllComplaints();
    res.json(complaints);
  } catch (err) {
    next(err);
  }
});

complaintRouter.get(
  "/:id",
  param("id").isMongoId().withMessage("Invalid ID format."),
  validateRequest,
  async (req, res, next) => {
    try {
      const complaint = await getComplaint(req.params.id);
      res.json(complaint);
    } catch (err) {
      next(err);
    }
  }
);

complaintRouter.post(
  "/",
  body("referenceId")
    .isString()
    .isLength({ min: 24, max: 24 })
    .withMessage("Reference ID must be a valid MongoDB ObjectId."),
  body("referenceType").isIn(["GoodsReceipt", "Sales"]),
  body("reason").isString().isLength({ min: 5, max: 500 }),
  body("quantity").isInt({ min: 1 }),
  body("status").isIn(["Open", "Resolved"]),
  validateRequest,
  async (req, res, next) => {
    try {
      const complaintData = matchedData(req) as ComplaintsResource;
      const newComplaint = await createComplaint(complaintData);
      res.status(201).json(newComplaint);
    } catch (err) {
      next(err);
    }
  }
);

complaintRouter.put(
  "/:id",
  param("id").isMongoId().withMessage("Invalid ID format."),
  body("referenceId")
    .optional()
    .isString()
    .isLength({ min: 24, max: 24 })
    .withMessage("Reference ID must be a valid MongoDB ObjectId."),
  body("referenceType").optional().isIn(["GoodsReceipt", "Sales"]),
  body("reason").optional().isString().isLength({ min: 5, max: 500 }),
  body("quantity").optional().isInt({ min: 1 }),
  body("status").optional().isIn(["Open", "Resolved"]),
  validateRequest,
  async (req, res, next) => {
    try {
      const complaintResource: ComplaintsResource = {
        id: req.params.id,
        ...req.body,
      };
      const updatedComplaint = await updateComplaint(complaintResource);
      res.json(updatedComplaint);
    } catch (err) {
      next(err);
    }
  }
);

complaintRouter.delete(
  "/:id",
  param("id").isMongoId().withMessage("Invalid ID format."),
  validateRequest,
  async (req, res, next) => {
    try {
      await deleteComplaint(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
);

export default complaintRouter;
