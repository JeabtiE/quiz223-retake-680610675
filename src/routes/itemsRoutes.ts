import { Router, type Request, type Response } from "express";
// import Zod validators
import {
  zUserId,
  zItemId,
  zItemPostBody,
  zItemPutBody,
  zItemDeleteBody
} from "../libs/zodValidators.js";
// import types
import type { Item, CustomRequest } from "../libs/types.js";
// import database
import { items } from "../db/db.js";
//import uuid
import { v4 as uuidv4 } from 'uuid';

import { authenticateToken } from "../middlewares/authenMiddleware.js";
import { checkRoleMiddleware } from "../middlewares/checkRoleMiddleware.js";
import { userInfo } from "os";

const router = Router();


// GET /api/vXXX/items/:userId 
router.get("/:userId",authenticateToken,checkRoleMiddleware,(req: CustomRequest, res: Response) => {
    try {
      const result = zUserId.safeParse(req.params.userId);
      if (!result.success) {
        return res.status(400).json({
          success: false, 
          message: "Validation failed", 
          errors: result.error.issues[0]?.message, 
        });
      }

      const userItems = items.filter((item: Item) => item.userId === result.data);

      if (userItems.length === 0) {
        return res.status(404).json({
          success: false, 
          message:`Item for user ${result.data} not found`, 
        });
      }
      
      const totalPrice = userItems.reduce(
        (sum, item) => sum + item.unit_price * item.quantity, 
        0 
      );

      return res.status(200).json({
        success: true, 
        data: userItems, 
        totalPrice, 
      });
    } catch (err) {
      return res.status(500).json({
        success: false, 
        message: "Something is wrong, please try again", 
        error: err, 
      });
    }

});

// POST /api/vXXX/items/:userId, body = {new item data}
// add a new Item for userId
router.post(
  "/:userId",
  authenticateToken, 
  checkRoleMiddleware, 
  (req: CustomRequest, res: Response) => {
    try {
      const result = zItemPostBody.safeParse({
        ...req.body, 
        userId: req.params.userId, 
        itemId: uuidv4(), 
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: result.error.issues[0]?.message,
        });
      }

      const newItem: Item = result.data;
      items.push(newItem);
      return res.status(201).json({
        success: true, 
        message: `New Item ${newItem.itemId} has been added successfully`, 
        data: newItem, 
      });
    } catch (err) {
      return res.status(500).json({
        success: false, 
        message: "Something is wrong, please try again", 
        error: err, 
      });
    }
  }
);

// Delete /api/vXXX/items/:userId
router.delete(
  "/:userId", 
  authenticateToken, 
  checkRoleMiddleware, 
  (req: CustomRequest, res: Response) => {
    try {
      const result = zItemDeleteBody.safeParse({
        userId: req.params.userId, 
        itemId: req.body?.itemId,
      });

      if (!result.success) {
        return res.status(400).json({
          success: false, 
          message: "Validation failed",
          errors: result.error.issues[0]?.message,
        });
      }

      const { userId, itemId } = result.data;

      const index = items.findIndex(
        (item: Item) => item.itemId === itemId && item.userId === userId
      );

      if (index === -1) {
        return res.status(404).json({
          success: false, 
          message: "Item does not exist", 
        });
      }

      const [deletedItem] = items.splice(index, 1);

      return res.status(200).json({
        success: true, 
        message: `Item ${itemId} has been deleted successfully`, 
        data: deletedItem, 
      });
    } catch (err) {
      return res.status(500).json({
        success: false, 
        message: "Something is wrong, please try again", 
        error: err,
      });
    }
  }
);

export default router;