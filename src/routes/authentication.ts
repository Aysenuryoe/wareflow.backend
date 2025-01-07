import { NextFunction, Request, Response } from "express";
import { verifyTokenExtractData } from "../services/JWTService";

declare global {
  namespace Express {
    export interface Request {
      userId?: string;
    }
  }
}
export async function authentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.userId = undefined;
  const auth = req.header("Authorization");
  if (auth && auth.startsWith("Bearer ")) {
    try {
      const jwtString = auth.substring("Bearer ".length);
      if (jwtString) {
        const login = await verifyTokenExtractData(jwtString);
        req.userId = login.userId;
        next();
      }
    } catch (error) {
      res.status(401);
      res.setHeader("WWW-Authenticate", [
        "Bearer",
        'realm="app"',
        'error="invalid_token"',
      ]);
      next(error);
    }
  } else {
    res.status(401);
    res.setHeader("WWW-Authenticate", ["Bearer", 'realm="app"']),
      next("Authentication required");
  }
}

export async function optionalAuthentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = req.header("Authorization");
  if (auth && auth.startsWith("Bearer")) {
    try {
      const jwtString = auth.substring("Bearer ".length);
      if (jwtString) {
        const login = await verifyTokenExtractData(jwtString);
        req.userId = login.userId;
        next();
      }
    } catch (error) {
      res.status(401);
      res.setHeader("WWW-Authenticate", [
        "Bearer",
        'realm="app"',
        'error="invalid_token"',
      ]);
      next(error);
    }
  } else {
    res.status(200);
  }
}

//export default authentication;
