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

// GET ALL PRODUCTS
export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ status: "in-stock" });

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE PRODUCT
export const getSingleProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
