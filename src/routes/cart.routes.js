import express from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { methodNotAllowed } from "../middlewares/methodNotAllowed.js";
import { addToCart } from "../controllers/cart.controller.js";
import upload from "../middlewares/multer.middleware.js";

const cartRoutes = express.Router();

// CART CREATE ROUTE - ADMIN ONLY
cartRoutes
  .route("/create")
  .post(protect, upload.none(), addToCart)
  .all(methodNotAllowed);

export default cartRoutes;
