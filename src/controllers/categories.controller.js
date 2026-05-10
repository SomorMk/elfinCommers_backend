import Category from "../models/Categories.modal.js";

// CREATE CATEGORY
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

// GET CATEGORIES
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE CATEGORY
export const updateCategories = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { title, description, status, featured } = req.body;

    const category = await Category.findById(categoryId);

    if (!category) {
      res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Category not found",
      });
      return;
    }

    if (title) category.title = title;
    if (description !== undefined) category.description = description;
    if (status) category.status = status;
    if (featured !== undefined && featured !== "") {
      category.featured = featured === "true" || featured === true;
    }

    await category.save();

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE CATEGORY
export const deleteCategories = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);

    if (!category) {
      res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Category not found",
      });
      return;
    }

    await Category.findByIdAndDelete(categoryId);

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
