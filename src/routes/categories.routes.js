import express from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { methodNotAllowed } from "../middlewares/methodNotAllowed.js";
import {
  createCategories,
  deleteCategories,
  getCategories,
  updateCategories,
} from "../controllers/categories.controller.js";
import upload from "../middlewares/multer.middleware.js";

const categoriesRoutes = express.Router();

// CATEGORY GET ROUTE
categoriesRoutes.route("/").get(getCategories).all(methodNotAllowed);

// CATEGORY CREATE ROUTE - ADMIN ONLY
categoriesRoutes
  .route("/create")
  .post(protect, restrictTo("admin"), upload.none(), createCategories)
  .all(methodNotAllowed);

// CATEGORY UPDATE ROUTE - ADMIN ONLY
categoriesRoutes
  .route("/update/:categoryId")
  .put(protect, upload.none(), restrictTo("admin"), updateCategories)
  .all(methodNotAllowed);

// CATEGORY DELETE ROUTE - ADMIN ONLY
categoriesRoutes
  .route("/delete/:categoryId")
  .delete(protect, restrictTo("admin"), deleteCategories)
  .all(methodNotAllowed);

export default categoriesRoutes;
