import { type Request, type Response, type NextFunction } from "express";
import { type CustomRequest, type User } from "../libs/types.js";
import { users } from "../db/db.js";

export const checkRoleMiddleware = (
  req: CustomRequest, 
  res: Response, 
  next: NextFunction 
) => {
  const payload = req.user;
  const token = req.token;

  const user = users.find((u: User) => u.username === payload?.username);

  if (!user || !token || !user.tokens?.includes(token)) {
    return res.status(401).json({
      success: false, 
      message: "Invalid token", 
    });
  }

  const { userId } = req.params;
  if (userId && userId !== payload?.userId) {
    return res.status(403).json({
      success: false, 
      message: "Forbidden access",
    });
  }

  return next();
};