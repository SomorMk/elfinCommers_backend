import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { methodNotAllowed } from "../middlewares/methodNotAllowed.js";
import { createOrder, getUserOrder } from "../controllers/order.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { getOrderById } from "../controllers/order.controller.js";

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

export default orderRoutes;
