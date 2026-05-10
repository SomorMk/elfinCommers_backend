import express from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { methodNotAllowed } from "../middlewares/methodNotAllowed.js";
import {
  createOrder,
  getUserOrder,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/order.controller.js";
import upload from "../middlewares/multer.middleware.js";

const orderRoutes = express.Router();

// GET USER ORDER ROUTE
orderRoutes.route("/").get(protect, getUserOrder).all(methodNotAllowed);

// CREATE ORDER ROUTE
orderRoutes
  .route("/create")
  .post(protect, upload.none(), createOrder)
  .all(methodNotAllowed);

// GET ORDER BY ID ROUTE
orderRoutes.route("/:orderId").get(protect, getOrderById).all(methodNotAllowed);

// UPDATE ORDER STATUS ROUTE
orderRoutes
  .route("/:orderId/status")
  .put(protect, upload.none(), updateOrderStatus)
  .all(methodNotAllowed);

// CANCEL ORDER ROUTE
orderRoutes
  .route("/:orderId/cancel")
  .put(protect, restrictTo("admin"), upload.none(), cancelOrder)
  .all(methodNotAllowed);

export default orderRoutes;
