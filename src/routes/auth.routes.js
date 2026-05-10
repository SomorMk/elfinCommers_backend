import express from "express";
import { signup, signin, logout } from "../controllers/auth.controller.js";
import upload from "../middlewares/multer.middleware.js";

const authRouter = express.Router();

// Authentication Routes
authRouter.post("/signup", upload.single("profilePicture"), signup);
authRouter.post("/signin", upload.none(), signin);
authRouter.post("/logout", logout);

export default authRouter;
