import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { methodNotAllowed } from "../middlewares/methodNotAllowed.js";
import {
  addToCart,
  getUserCart,
  removeFromCart,
} from "../controllers/cart.controller.js";
import upload from "../middlewares/multer.middleware.js";

const cartRoutes = express.Router();

// GET USER CART ROUTE
cartRoutes
  .route("/")
  .get(protect, upload.none(), getUserCart)
  .all(methodNotAllowed);

// ADD TO CART ROUTE
cartRoutes
  .route("/add")
  .post(protect, upload.none(), addToCart)
  .all(methodNotAllowed);

// REMOVE FROM CART ROUTE
cartRoutes
  .route("/remove")
  .delete(protect, upload.none(), removeFromCart)
  .all(methodNotAllowed);

export default cartRoutes;
