import express from "express";
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blog.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { methodNotAllowed } from "../middlewares/methodNotAllowed.js";

const router = express.Router();

router.route("/").get(getBlogs).post(protect, createBlog).all(methodNotAllowed);

router
  .route("/:id")
  .get(getBlogById)
  .put(protect, updateBlog)
  .delete(protect, deleteBlog)
  .all(methodNotAllowed);

export default router;
