import Product from "../models/Product.modal";
import Wishlist from "../models/Wishlist.modal";

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

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (wishlist) {
      wishlist.products.push(product._id);
      await wishlist.save();
    } else {
      const wishlist = new Wishlist({
        user: req.user._id,
        products: [product._id],
      });
      await wishlist.save();
    }

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Product added to wishlist successfully",
    });
  } catch (error) {
    next(error);
  }
};
