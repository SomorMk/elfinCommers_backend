import Product from "../models/Product.modal.js";

// CREATE PRODUCT
export const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      discountPrice,
      images,
      category,
      stock,
      brand,
      isFeatured,
      status,
    } = req.body;

    const existingProduct = await Product.findOne({ title });
    if (existingProduct) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Product already exists with this name",
      });
    }

    const product = await Product.create({
      title,
      description,
      price,
      discountPrice,
      images,
      category,
      stock,
      brand,
      isFeatured,
      status,
    });

    res.status(201).json({
      statusCode: 201,
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
