import User from "../models/User.model.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "30d",
  });
};

export const signup = async (req, res, next) => {
  try {
    const { username, email, password, mobile } = req.body;
    const profilePicture =
      req.file && `${process.env.BASE_URL}/uploads/${req.file.filename}`;

    if (!username || !email || !password) {
      res.status(422);
      return res.json({
        statusCode: 422,
        success: false,
        message: "username, email, and password are required",
      });
    }

    if (!email.includes("@")) {
      res.status(422);
      return res.json({
        statusCode: 422,
        success: false,
        message: "Invalid email format",
      });
    }

    if (password.length < 8) {
      res.status(422);
      return res.json({
        statusCode: 422,
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(422);
      return res.json({
        statusCode: 422,
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      username,
      email,
      password,
      mobile,
      profilePicture,
    });

    if (user) {
      res.status(201).json({
        success: true,
        statusCode: 201,
        message: "User created successfully",
        data: {
          _id: user._id,
          username: user?.username,
          email: user?.email,
          mobile: user?.mobile,
          role: user?.role,
          isVerified: user?.isVerified,
          status: user?.status,
          profilePicture: user?.profilePicture,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400);
      return res.json({
        statusCode: 400,
        success: false,
        message: "Invalid user data, please try again.",
      });
    }
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified,
        status: user.status,
        profilePicture: user.profilePicture,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      return res.json({
        statusCode: 401,
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Logged out successfully",
  });
};
