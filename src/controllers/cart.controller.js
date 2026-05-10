import Cart from "../models/Cart.modal.js";
import Product from "../models/Product.modal.js";
import mongoose from "mongoose";

// ADD TO CART (Single or Bulk)
export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let { productId, quantity, items } = req.body;

    // Normalize input to an array of items
    let itemsToAdd = [];
    if (items && Array.isArray(items)) {
      itemsToAdd = items;
    } else if (productId && quantity) {
      itemsToAdd = [{ productId, quantity }];
    }

    if (itemsToAdd.length === 0) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Please provide product(s) and quantity",
      });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, products: [] });
    }

    // Process each item
    for (const item of itemsToAdd) {
      const { productId: pId, quantity: qty } = item;

      if (!mongoose.Types.ObjectId.isValid(pId)) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: `Invalid product ID: ${pId}`,
        });
      }

      // Check if product exists in DB
      const productExists = await Product.findById(pId);
      if (!productExists) {
        return res.status(404).json({
          statusCode: 404,
          success: false,
          message: `Product with ID ${pId} not found`,
        });
      }

      const productIndex = cart.products.findIndex(
        (p) => p.product.toString() === pId,
      );

      if (productIndex > -1) {
        // Increment quantity if product exists
        cart.products[productIndex].quantity += Number(qty);
      } else {
        // Add new product entry
        cart.products.push({
          product: pId,
          quantity: Number(qty),
        });
      }
    }

    await cart.save();

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Cart updated successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// GET USER CART
export const getUserCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId })
      .populate("products.product", "name images price")
      .lean();

    if (!cart) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Cart not found",
        data: null,
      });
    }

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Cart fetched successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// REMOVE FROM CART (Single or Bulk)
export const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let { productId, productIds, quantity, quantities, all } = req.body;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Cart not found",
      });
    }

    if (all === "true" || all === true) {
      cart.products = [];
      await cart.save();
      return res.status(200).json({
        statusCode: 200,
        success: true,
        message: "All items removed from cart",
        data: cart,
      });
    }

    let removals = [];

    if (productIds && Array.isArray(productIds)) {
      removals = productIds.map((id, index) => ({
        productId: id,
        quantity: quantities && quantities[index] ? quantities[index] : 1,
      }));
    } else if (productId && quantity) {
      removals = [{ productId, quantity }];
    } else {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Please provide product ID(s) and quantity or specify all",
      });
    }

    for (const removal of removals) {
      const { productId: pId, quantity: qty } = removal;

      if (!mongoose.Types.ObjectId.isValid(pId)) continue;

      const productIndex = cart.products.findIndex(
        (p) => p.product.toString() === pId,
      );

      if (productIndex === -1) continue;

      const currentQty = cart.products[productIndex].quantity;
      const qtyToRemove = Number(qty);

      if (qtyToRemove >= currentQty) {
        // Remove product completely
        cart.products.splice(productIndex, 1);
      } else {
        // Decrease quantity
        cart.products[productIndex].quantity -= qtyToRemove;
      }
    }

    await cart.save();

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Cart updated successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};
