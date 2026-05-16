import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  initPayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
} from "../controllers/payment.controller.js";
import { methodNotAllowed } from "../middlewares/methodNotAllowed.js";

const paymentRoutes = express.Router();

paymentRoutes.route("/init").post(protect, initPayment).all(methodNotAllowed);

paymentRoutes.route("/success").post(paymentSuccess).all(methodNotAllowed);

paymentRoutes.route("/fail").post(paymentFail).all(methodNotAllowed);

paymentRoutes.route("/cancel").post(paymentCancel).all(methodNotAllowed);

export default paymentRoutes;
