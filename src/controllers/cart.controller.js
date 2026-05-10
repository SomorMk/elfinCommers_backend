import Cart from "../models/Cart.modal.js";

// CREATE CATEGORY
export const addToCart = async (req, res, next) => {
  try {
    const { userId, productId, quantity } = req.body;

    const existingCart = await Cart.findOne({ user: userId });

    if (existingCart) {
      existingCart.products.push({
        product: productId,
        quantity,
      });

      await existingCart.save();

      return res.status(200).json({
        statusCode: 200,
        success: true,
        message: "Cart updated successfully",
      });
    }

    const cart = await Cart.create({
      user: userId,
      products: [
        {
          product: productId,
          quantity,
        },
      ],
    });

    res.status(201).json({
      statusCode: 201,
      success: true,
      message: "Cart created successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};
