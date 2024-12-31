import { JwtPayload, sign, verify } from "jsonwebtoken";
import { logger } from "../../src/logger";
import { User } from "../models/UserModel";
import dotenv from "dotenv";
dotenv.config();

const timeToLive = parseInt(process.env.JWT_TTL ?? "");
const secretKey = process.env.JWT_SECRET ?? "";

export async function verifyCredentialsGenerateToken(
  email: string,
  password: string
): Promise<string | undefined> {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user?.isCorrectPassword(password))) {
    return undefined;
  }
  if (!timeToLive) {
    const errorMsg = "TTL is not set";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
  if (!secretKey) {
    const errorMsg = "Secret is not set";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
  const payload: JwtPayload = {
    sub: user?.id,
  };
  const jwtString = sign(payload, secretKey, {
    expiresIn: timeToLive,
    algorithm: "HS256",
  });
  return jwtString;
}

export async function verifyTokenExtractData(
  jwtString: string | undefined
): Promise<{ userId: string }> {
  if (!secretKey || !jwtString) {
    const errorMsg = "Failed to verify JWT";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const payload = verify(jwtString, secretKey) as JwtPayload;
    const { sub, role } = payload;
    if (typeof sub !== "string") {
      const errMsg = "Invalid JWT";
      logger.error(errMsg);
      throw new Error(errMsg);
    }

    return { userId: sub };
  } catch (error) {
    const errMsg = "Invalid JWT";
    logger.error(errMsg);
    throw new Error(errMsg);
  }
}
