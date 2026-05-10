import express from "express";
import {
  getProfileInfo,
  updateProfileInfo,
  updateProfilePassword,
} from "../controllers/profile.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { methodNotAllowed } from "../middlewares/methodNotAllowed.js";

const profileRouter = express.Router();

// Profile Routes
profileRouter.route("/info").get(protect, getProfileInfo).all(methodNotAllowed);

profileRouter
  .route("/update")
  .put(protect, upload.single("profilePicture"), updateProfileInfo)
  .all(methodNotAllowed);

profileRouter
  .route("/update-password")
  .put(protect, upload.none(), updateProfilePassword)
  .all(methodNotAllowed);

export default profileRouter;
