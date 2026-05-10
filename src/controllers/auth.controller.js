import User from "../models/User.model.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "30d",
  });
};

// ===========================================================
//                    SIGNUP CONTROLLER
// ===========================================================
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

    const user = new User({
      username,
      email,
      password,
      mobile,
      profilePicture,
    });

    const accessToken = generateToken(user._id);
    user.accessToken = accessToken;
    await user.save();

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
          accessToken: accessToken,
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

// ===========================================================
//                    SIGNIN CONTROLLER
// ===========================================================
export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(422);
      return res.json({
        statusCode: 422,
        success: false,
        message: "Email and password are required",
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

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      const accessToken = generateToken(user._id);
      user.accessToken = accessToken;
      await user.save();

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: "User logged in successfully",
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          isVerified: user.isVerified,
          status: user.status,
          profilePicture: user.profilePicture,
          accessToken: accessToken,
        },
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

// ===========================================================
//                    LOGOUT CONTROLLER
// ===========================================================
export const logout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401);
      return res.json({
        statusCode: 401,
        success: false,
        message: "No token provided or invalid format",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_secret",
      );

      const user = await User.findById(decoded.id);

      if (user) {
        user.accessToken = null;
        await user.save();
      }

      res.status(200).json({
        statusCode: 200,
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      res.status(401);
      return res.json({
        statusCode: 401,
        success: false,
        message: "Invalid or expired token",
      });
    }
  } catch (error) {
    next(error);
  }
};
