import express from "express";
import {
  getProfileInfo,
  updateProfileInfo,
} from "../controllers/profile.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";

const profileRouter = express.Router();

// Profile Routes
profileRouter.get("/info", protect, getProfileInfo);
profileRouter.put("/update", protect, upload.single("profilePicture"), updateProfileInfo);

export default profileRouter;
