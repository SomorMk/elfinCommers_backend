import express from "express";
import { signup, signin, logout, verifyOtp, resendOtp } from "../controllers/auth.controller.js";
import upload from "../middlewares/multer.middleware.js";

import { methodNotAllowed } from "../middlewares/methodNotAllowed.js";

const authRouter = express.Router();

// Authentication Routes
authRouter
  .route("/signup")
  .post(upload.single("profilePicture"), signup)
  .all(methodNotAllowed);

authRouter.route("/signin").post(upload.none(), signin).all(methodNotAllowed);

authRouter.route("/logout").post(upload.none(), logout).all(methodNotAllowed);

authRouter.route("/verify-otp").post(upload.none(), verifyOtp).all(methodNotAllowed);

authRouter.route("/resend-otp").post(upload.none(), resendOtp).all(methodNotAllowed);

export default authRouter;
