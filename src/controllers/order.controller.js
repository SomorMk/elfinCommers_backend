import Order from "../models/Order.modal.js";
import Product from "../models/Product.modal.js";
import Cart from "../models/Cart.modal.js";
import mongoose from "mongoose";

// CREATE ORDER
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, paymentMethod, items, fromCart } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Shipping address is required",
      });
    }

    let orderItems = [];
    let totalAmount = 0;
    let productsToUpdate = [];

    if (fromCart === "true" || fromCart === true) {
      // Order from Cart
      const cart = await Cart.findOne({ user: userId }).populate(
        "products.product",
      );

      if (!cart || cart.products.length === 0) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: "Your cart is empty",
        });
      }

      for (const cartItem of cart.products) {
        if (!cartItem.product) continue;

        if (cartItem.product.stock < cartItem.quantity) {
          return res.status(400).json({
            statusCode: 400,
            success: false,
            message: `Insufficient stock for product: ${cartItem.product.title || "Unknown"}`,
          });
        }

        const price =
          cartItem.product.discountPrice > 0
            ? cartItem.product.discountPrice
            : cartItem.product.price;

        orderItems.push({
          product: cartItem.product._id,
          quantity: cartItem.quantity,
          price: price,
        });

        productsToUpdate.push({
          productId: cartItem.product._id,
          quantity: cartItem.quantity,
        });

        totalAmount += price * cartItem.quantity;
      }
    } else if (items && Array.isArray(items) && items.length > 0) {
      // Direct Purchase
      for (const item of items) {
        const { productId, quantity } = item;
        const requestedQuantity = Number(quantity) || 1;

        if (!mongoose.Types.ObjectId.isValid(productId)) continue;

        const product = await Product.findById(productId);
        if (!product) continue;

        if (product.stock < requestedQuantity) {
          return res.status(400).json({
            statusCode: 400,
            success: false,
            message: `Insufficient stock for product: ${product.title || "Unknown"}`,
          });
        }

        const price =
          product.discountPrice > 0 ? product.discountPrice : product.price;

        orderItems.push({
          product: product._id,
          quantity: requestedQuantity,
          price: price,
        });

        productsToUpdate.push({
          productId: product._id,
          quantity: requestedQuantity,
        });

        totalAmount += price * requestedQuantity;
      }
    } else {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Please provide items to order or set fromCart to true",
      });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "No valid products found for order",
      });
    }

    // Create the order
    const order = await Order.create({
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || "Cash on Delivery",
      totalAmount,
    });

    // Update product stock
    for (const p of productsToUpdate) {
      await Product.findByIdAndUpdate(p.productId, {
        $inc: { stock: -p.quantity },
      });
    }

    // If the cart is empty when ordering from cart
    if (fromCart === "true" || fromCart === true) {
      await Cart.findOneAndUpdate({ user: userId }, { products: [] });
    }

    res.status(201).json({
      statusCode: 201,
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
