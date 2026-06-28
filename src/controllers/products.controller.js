import Product from "../models/Product.modal.js";
import mongoose from "mongoose";
import fs from "fs";
import { uploadToCloudinary } from "../utils/cloudinary.js";

// CREATE PRODUCT
export const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      discountPrice,
      category,
      stock,
      brand,
      isFeatured,
      status,
    } = req.body;

    const existingProduct = await Product.findOne({ title });
    if (existingProduct) {
      // Clean up uploaded temporary files to prevent server disk clutter
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Product already exists with this name",
      });
    }

    // Upload files to Cloudinary and collect their secure URLs
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.path, "products")
      );
      imageUrls = await Promise.all(uploadPromises);
    } else if (req.body.images) {
      imageUrls = Array.isArray(req.body.images)
        ? req.body.images
        : [req.body.images];
    }

    if (imageUrls.length === 0) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "At least one product image is required",
      });
    }

    const product = await Product.create({
      title,
      description,
      price,
      discountPrice,
      images: imageUrls,
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
    // If an error occurred mid-process, make sure any remaining uploaded files are deleted
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
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
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Invalid Product ID format",
      });
    }

    const product = await Product.findById(id);

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

// DELETE PRODUCT
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Invalid Product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      // Clean up uploaded temporary files if ID is invalid
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Invalid Product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      // Clean up uploaded temporary files if product is not found
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Product not found",
      });
    }

    const {
      title,
      description,
      price,
      discountPrice,
      category,
      stock,
      brand,
      isFeatured,
      status,
    } = req.body;

    // Handle new images upload if present
    let updatedImages = product.images; // Default to existing images

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.path, "products")
      );
      updatedImages = await Promise.all(uploadPromises);
    } else if (req.body.images) {
      updatedImages = Array.isArray(req.body.images)
        ? req.body.images
        : [req.body.images];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        title,
        description,
        price,
        discountPrice,
        images: updatedImages,
        category,
        stock,
        brand,
        isFeatured,
        status,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    // Clean up uploaded temporary files if update fails
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    next(error);
  }
};
