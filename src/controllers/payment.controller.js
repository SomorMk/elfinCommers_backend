import { sslcz } from "../config/sslcommerz.js";
import Order from "../models/Order.modal.js";
import mongoose from "mongoose";

export const initPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Order ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(orderId)
      .populate("user")
      .populate("orderItems.product");

    if (!order) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentMethod !== "advance_payment") {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Payment is only required for advance_payment method",
      });
    }

    if (order.paymentStatus === "Completed") {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Order is already paid",
      });
    }

    const transactionId = new mongoose.Types.ObjectId().toString();

    // Prepare product names for SSLCommerz
    const productNames = order.orderItems
      .map((item) => item.product.title)
      .join(", ");

    const data = {
      total_amount: order.totalAmount,

      currency: "BDT",
      tran_id: transactionId,

      success_url: `${process.env.FRONTEND_BASE_URL}/payment/success?tran_id=${transactionId}`,
      fail_url: `${process.env.FRONTEND_BASE_URL}/payment/fail?tran_id=${transactionId}`,
      cancel_url: `${process.env.FRONTEND_BASE_URL}/payment/cancel?tran_id=${transactionId}`,

      shipping_method: "Courier",

      product_name: productNames || "Products",
      product_category: "general",
      product_profile: "general",

      cus_name: order.user.username || "No Name Found",
      cus_email: order.user.email || "No Email Found",

      cus_add1: order.shippingAddress.address,
      cus_city: order.shippingAddress.city,
      cus_postcode: order.shippingAddress.postalCode,
      cus_country: order.shippingAddress.country,
      cus_phone: order.shippingAddress.phone,

      ship_name: order.user.username,
      ship_add1: order.shippingAddress.address,
      ship_city: order.shippingAddress.city,
      ship_postcode: order.shippingAddress.postalCode,
      ship_country: order.shippingAddress.country,
    };

    const apiResponse = await sslcz.init(data);

    // Update order with transaction ID
    order.transactionId = transactionId;
    await order.save();

    let GatewayPageURL = apiResponse.GatewayPageURL;

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Payment initiated successfully",
      data: {
        url: GatewayPageURL,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const paymentSuccess = async (req, res, next) => {
  try {
    const { tran_id } = req.body.tran_id ? req.body : req.query;

    if (!tran_id) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Transaction ID is required",
      });
    }

    const order = await Order.findOne({ transactionId: tran_id });

    if (!order) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Order not found",
      });
    }

    order.paymentStatus = "Completed";
    await order.save();

    // Redirect to frontend success page
    res.redirect(
      `${process.env.FRONTEND_BASE_URL}/payment/success?tran_id=${tran_id}`,
    );
  } catch (error) {
    next(error);
  }
};

export const paymentFail = async (req, res, next) => {
  try {
    const { tran_id } = req.body.tran_id ? req.body : req.query;

    const order = await Order.findOne({ transactionId: tran_id });

    if (order) {
      order.paymentStatus = "Failed";
      await order.save();
    }

    res.redirect(
      `${process.env.FRONTEND_BASE_URL}/payment/fail?tran_id=${tran_id}`,
    );
  } catch (error) {
    next(error);
  }
};

export const paymentCancel = async (req, res, next) => {
  try {
    const { tran_id } = req.body.tran_id ? req.body : req.query;

    const order = await Order.findOne({ transactionId: tran_id });

    if (order) {
      order.paymentStatus = "Pending";
      await order.save();
    }

    res.redirect(
      `${process.env.FRONTEND_BASE_URL}/payment/cancel?tran_id=${tran_id}`,
    );
  } catch (error) {
    next(error);
  }
};
