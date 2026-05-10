import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { methodNotAllowed } from "../middlewares/methodNotAllowed.js";
import { addToCart } from "../controllers/cart.controller.js";
import upload from "../middlewares/multer.middleware.js";

const cartRoutes = express.Router();

// ADD TO CART ROUTE
cartRoutes
  .route("/add")
  .post(protect, upload.none(), addToCart)
  .all(methodNotAllowed);

export default cartRoutes;
