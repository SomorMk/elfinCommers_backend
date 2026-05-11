import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { methodNotAllowed } from "../middlewares/methodNotAllowed.js";
import {
  addToWishlist,
  //   getUserWishlist,
  //   removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import upload from "../middlewares/multer.middleware.js";

const wishlistRoutes = express.Router();

// GET USER WISHLIST ROUTE
// wishlistRoutes
//   .route("/")
//   .get(protect, upload.none(), getUserWishlist)
//   .all(methodNotAllowed);

// ADD TO WISHLIST ROUTE
wishlistRoutes
  .route("/add")
  .post(protect, upload.none(), addToWishlist)
  .all(methodNotAllowed);

// REMOVE FROM WISHLIST ROUTE
// wishlistRoutes
//   .route("/remove")
//   .delete(protect, upload.none(), removeFromWishlist)
//   .all(methodNotAllowed);

export default wishlistRoutes;
