import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { methodNotAllowed } from "../middlewares/methodNotAllowed.js";
import { createOrder } from "../controllers/order.controller.js";
import upload from "../middlewares/multer.middleware.js";

const orderRoutes = express.Router();

// CREATE ORDER ROUTE
orderRoutes
  .route("/create")
  .post(protect, upload.none(), createOrder)
  .all(methodNotAllowed);

export default orderRoutes;
