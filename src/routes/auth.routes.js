import express from "express";
import { signup, signin, logout } from "../controllers/auth.controller.js";
import upload from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/signup", upload.single("profilePicture"), signup);
router.post("/signin", signin);
router.post("/logout", logout);

export default router;
