import express from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { methodNotAllowed } from "../middlewares/methodNotAllowed.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
} from "../controllers/products.controller.js";
import upload from "../middlewares/multer.middleware.js";

const productRoutes = express.Router();

// PRODUCT LIST GET ROUTE - PUBLIC
productRoutes.route("/").get(getAllProducts).all(methodNotAllowed);

// PRODUCT CREATE ROUTE - ADMIN ONLY
productRoutes
  .route("/create")
  .post(protect, restrictTo("admin"), upload.array("images"), createProduct)
  .all(methodNotAllowed);

// SINGLE PRODUCT GET ROUTE - PUBLIC
productRoutes.route("/:id").get(getSingleProduct).all(methodNotAllowed);

// PRODUCT DELETE ROUTE - ADMIN ONLY
productRoutes
  .route("/delete/:id")
  .delete(protect, restrictTo("admin"), deleteProduct)
  .all(methodNotAllowed);

// UPDATE PRODUCT ROUTE - ADMIN ONLY
productRoutes
  .route("/update/:id")
  .patch(protect, restrictTo("admin"), upload.array("images"), updateProduct)
  .all(methodNotAllowed);

export default productRoutes;
