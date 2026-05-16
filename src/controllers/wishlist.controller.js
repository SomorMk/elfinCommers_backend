import Product from "../models/Product.modal.js";
import Wishlist from "../models/Wishlist.modal.js";

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Product not found",
      });
    }

    const existingWishlistItem = await Wishlist.findOne({
      user: req.user._id,
      product: productId,
    });

    if (existingWishlistItem) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Product already in wishlist",
      });
    }

    const wishlist = new Wishlist({
      user: req.user._id,
      product: productId,
    });
    await wishlist.save();

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Product added to wishlist successfully",
    });
  } catch (error) {
    next(error);
  }
};

// GET USER WISHLIST CONTROLLER
export const getUserWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user._id }).populate(
      "product",
      "_id title price images",
    );

    res.status(200).json({
      statusCode: 200,
      success: true,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// REMOVE FROM WISHLIST CONTROLLER
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Product ID is required",
      });
    }

    const wishlist = await Wishlist.findOneAndDelete({
      user: req.user._id,
      product: productId,
    });

    if (!wishlist) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Wishlist item not found",
      });
    }

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Product removed from wishlist successfully",
    });
  } catch (error) {
    next(error);
  }
};
