import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import { type CustomRequest, type UserPayload } from "../libs/types.js";

export const authenticateToken = (
  req: CustomRequest, 
  res: Response,
  next: NextFunction 
) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization header is required",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token is required", 
    });
  }

  try {
    const jwt_secret = process.env.JWT_SECRET || "this_is_my_secret";
    const payload = jwt.verify(token, jwt_secret) as UserPayload;

    req.user = payload; 
    req.token = token; 

    return next();
  } catch (err) {
    return res.status(403).json({
      success: false, 
      message: "Invalid or expired token", 
    });
  }
};

