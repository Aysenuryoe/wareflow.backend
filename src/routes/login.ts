import express from "express";
import { body, matchedData, validationResult } from "express-validator";
import { IUser } from "../models/UserModel";
import { LoginResource } from "../../src/Resources";
import { verifyCredentialsGenerateToken } from "../services/JWTService";

const loginrouter = express.Router();

loginrouter.post(
  "/",
  body("email").isEmail(),
  body("password").isString().isStrongPassword(),
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array() });
    }
    try {
      let login = matchedData(req) as IUser;
      let jwtToken = await verifyCredentialsGenerateToken(
        login.email,
        login.password
      );
      if (!jwtToken) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const loginResource: LoginResource = {
        accessToken: jwtToken,
        tokenType: "Bearer",
      };
      res.status(200).json(loginResource);
    } catch (error) {
      res.status(500).json({ error: "Internal server error occured." });
    }
  }
);

export default loginrouter;
