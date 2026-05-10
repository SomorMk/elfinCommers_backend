import express from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { methodNotAllowed } from "../middlewares/methodNotAllowed.js";
import {
  createCategories,
  //   getCategories,
  //   updateCategories,
  //   deleteCategories,
} from "../controllers/categories.controller.js";
import upload from "../middlewares/multer.middleware.js";

const categoriesRoutes = express.Router();

// CATEGORY CREATE ROUTE
categoriesRoutes
  .route("/create")
  .post(protect, restrictTo("admin"), upload.none(), createCategories)
  .all(methodNotAllowed);

// CATEGORY GET ROUTE
// categoriesRoutes.route("/").get(protect, getCategories).all(methodNotAllowed);

// categoriesRoutes
//   .route("/update/:categoryId")
//   .put(protect, updateCategories)
//   .all(methodNotAllowed);

// categoriesRoutes
//   .route("/delete/:categoryId")
//   .delete(protect, deleteCategories)
//   .all(methodNotAllowed);

export default categoriesRoutes;
