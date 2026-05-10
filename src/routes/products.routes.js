import express from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { methodNotAllowed } from "../middlewares/methodNotAllowed.js";
import {
  createProduct,
  getAllProducts,
  getSingleProduct,
} from "../controllers/products.controller.js";
import upload from "../middlewares/multer.middleware.js";

const productRoutes = express.Router();

// PRODUCT LIST GET ROUTE - PUBLIC
productRoutes.route("/").get(getAllProducts).all(methodNotAllowed);

// SINGLE PRODUCT GET ROUTE - PUBLIC
productRoutes.route("/:id").get(getSingleProduct).all(methodNotAllowed);

// PRODUCT CREATE ROUTE - ADMIN ONLY
productRoutes
  .route("/create")
  .post(protect, restrictTo("admin"), upload.array("images"), createProduct)
  .all(methodNotAllowed);

export default productRoutes;
