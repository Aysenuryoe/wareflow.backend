import express from "express";
import { body, matchedData, param, validationResult } from "express-validator";
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../services/UserService";
import { UserResource } from "../../src/Resources";
import { User } from "../../src/models/UserModel";

const userRouter = express.Router();

userRouter.get("/all", async (req, res, next) => {
  const users = await getAllUsers();
  res.status(200).json(users);
});

userRouter.get("/:id", param("id").isMongoId(), async (req, res, next) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(400).json({ errors: err.array() });
  }
  try {
    const user = await getUser(req.params!.id);
    res.status(200).json(user);
  } catch (err) {
    if (err instanceof Error) {
      res.status(404).send({ error: err.message });
      next(err);
    }
  }
});

userRouter.post(
  "/",
  body("email")
    .custom(async (value) => {
      const existingUser = await User.findOne({ email: value });
      if (existingUser) {
        throw new Error("Email already exists");
      }
      return true;
    })
    .isEmail()
    .normalizeEmail()
    .isLength({ min: 1, max: 100 }),
  body("password").isString().isStrongPassword().isLength({ min: 8, max: 100 }),
  body("admin").isBoolean(),
  async (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const userData = matchedData(req) as UserResource;
      const user = await createUser(userData);
      res.status(201).send(user);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

userRouter.put(
  "/:id",
  param("id")
    .custom((value, { req }) => {
      if (value !== req.body.id) {
        throw new Error("Ids do not match");
      }
      return true;
    })
    .isMongoId(),
  body("id")
    .custom((value, { req }) => {
      if (value !== req.params!.id) {
        throw new Error("Ids do not match");
      }
      return true;
    })
    .isMongoId(),
  body("email")
    .custom(async (value) => {
      const existingUser = await User.findOne({ email: value });
      if (existingUser) {
        throw new Error("Email already exists");
      }
      return true;
    })
    .isEmail()
    .normalizeEmail()
    .isLength({ min: 1, max: 100 }),
  body("admin").isBoolean(),
  body("password")
    .isString()
    .isStrongPassword()
    .isLength({ min: 1, max: 100 })
    .optional(),
  async (req, res, next) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      const userResource = {
        id: req.params!.id,
        ...req.body,
      };
      const user = await updateUser(userResource);
      res.send(user);
      res.sendStatus(403);
    } catch (err) {
      if (err instanceof Error) {
        res.status(404).send({ error: err.message });
        next(err);
      }
    }
  }
);

userRouter.delete("/:id", param("id").isMongoId(), async (req, res, next) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(400).json({ errors: err.array() });
  }
  try {
    await deleteUser(req.params!.id);
    res.status(204).end();
  } catch (err) {
    if (err instanceof Error) {
      res.status(404).send({ error: err.message });
      next(err);
    }
  }
});

export default userRouter;
