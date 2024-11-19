import express, { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from "../../src/services/ProductService";
// import { authentication } from "../../src/routes/authentication";
// import { authorizeRole } from "../../src/middleware/roleMiddleware";

const productRouter = express.Router();

productRouter.get(
  "/all",
  //  authentication,
  //  authorizeRole(["a", "u"]),
  async (req, res, next) => {
    try {
      const products = await getAllProducts();
      res.json(products);
    } catch (err) {
      next(err);
    }
  }
);

productRouter.get(
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
      const product = await getProduct(req.params!.id);
      res.send(product);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

productRouter.post(
  "/",
  body("article").isString().isLength({ min: 1, max: 100 }),
  body("price").isFloat({ min: 1, max: 99 }),
  body("barcode")
    .isString()
    .isLength({ min: 6, max: 6 })
    .withMessage("Barcode must be exactly 6 characters long."),
  body("productNum").isString().isLength({ min: 10, max: 10 }),
  body("stock").isInt({ min: 0 }),
  // authentication,
  // authorizeRole(["a"]),
  async (req: Request, res: Response, next: NextFunction) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const productData = req.body;
      const newProduct = await createProduct(productData);
      return res.status(201).json(newProduct);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

productRouter.put(
  "/:id",
  param("id").isMongoId(),
  body("article").isString().isLength({ min: 1, max: 100 }),
  body("price").isFloat({ min: 1, max: 99 }),
  body("barcode")
    .isString()
    .isLength({ min: 6, max: 6 })
    .withMessage("Barcode must be exactly 6 characters long."),
  body("productNum").isString().isLength({ min: 10, max: 10 }),
  body("stock").isInt({ min: 0 }),
  // authentication,
  // authorizeRole(["a"]),
  async (req: Request, res: Response, next: NextFunction) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const productResource = {
        id: req.params.id,
        ...req.body,
      };
      const product = await updateProduct(productResource);
      res.status(200).send(product);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

productRouter.delete(
  "/:id",
  param("id").isMongoId(),
  // authentication,
  // authorizeRole(["a"]),
  async (req: Request, res: Response, next: NextFunction) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const id = req.params.id;
      await deleteProduct(id);
      res.status(204).end();
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

export default productRouter;
