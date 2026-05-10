import Blog from "../models/Blog.model.js";

export const getBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find().populate("author", "username email");
    res.json(blogs);
  } catch (error) {
    next(error);
  }
};

export const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "username email");
    if (!blog) {
      res.status(404);
      throw new Error("Blog not found");
    }
    res.json(blog);
  } catch (error) {
    next(error);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;
    const blog = await Blog.create({
      title,
      content,
      tags,
      author: req.user._id,
    });
    res.status(201).json(blog);
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      res.status(404);
      throw new Error("Blog not found");
    }

    // Check ownership
    if (blog.author.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error("Not authorized to update this blog");
    }

    const { title, content, tags } = req.body;
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.tags = tags || blog.tags;

    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      res.status(404);
      throw new Error("Blog not found");
    }

    // Check ownership
    if (blog.author.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error("Not authorized to delete this blog");
    }

    await blog.deleteOne();
    res.json({ message: "Blog removed" });
  } catch (error) {
    next(error);
  }
};
