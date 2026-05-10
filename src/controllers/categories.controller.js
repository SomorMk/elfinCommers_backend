import Category from "../models/Categories.modal.js";

export const createCategories = async (req, res, next) => {
  try {
    const { title, description, status, featured } = req.body;

    // If category already exists
    const existingCategory = await Category.findOne({ title });
    if (existingCategory) {
      res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Category already exists",
      });
      return;
    }

    const category = await Category.create({
      title,
      description,
      status,
      featured,
    });
    res.status(201).json({
      statusCode: 201,
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};
