import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { sendEmail } from "../utils/email.js";

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

    if (!username || !email || !password) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(422);
      return res.json({
        statusCode: 422,
        success: false,
        message: "username, email, and password are required",
      });
    }

    if (!email.includes("@")) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(422);
      return res.json({
        statusCode: 422,
        success: false,
        message: "Invalid email format",
      });
    }

    if (password.length < 8) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(422);
      return res.json({
        statusCode: 422,
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(422);
      return res.json({
        statusCode: 422,
        success: false,
        message: "User already exists",
      });
    }

    // Upload profile picture to Cloudinary if file is uploaded, fallback to string URL in req.body
    let profilePictureUrl = "";
    if (req.file) {
      profilePictureUrl = await uploadToCloudinary(req.file.path, "profiles");
    } else if (req.body.profilePicture) {
      profilePictureUrl = req.body.profilePicture;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const user = new User({
      username,
      email,
      password,
      mobile,
      profilePicture: profilePictureUrl,
      verificationOtp: otp,
      verificationOtpExpires: otpExpires,
    });

    await user.save();

    let emailSent = false;
    try {
      await sendEmail({
        to: user.email,
        subject: "Verify your email - Elfin Commerce",
        text: `Your verification OTP code is: ${otp}. It will expire in 15 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #4F46E5; text-align: center;">Welcome to Elfin Commerce!</h2>
            <p>Thank you for signing up. Please verify your email address by entering the 6-digit verification code below:</p>
            <div style="background-color: #F3F4F6; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 15px; margin: 20px 0; border-radius: 6px; color: #1F2937;">
              ${otp}
            </div>
            <p style="color: #6B7280; font-size: 14px;">This code is valid for 15 minutes. If you did not request this, please ignore this email.</p>
          </div>
        `,
      });
      emailSent = true;
    } catch (emailError) {
      console.error("Signup email send failed:", emailError);
    }

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: emailSent
        ? "Registration successful. Please verify your email with the 6-digit OTP code sent to you."
        : "Registration successful, but failed to send verification email. Please request a new OTP code.",
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified,
        status: user.status,
        profilePicture: user.profilePicture,
      },
    });
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
      if (!user.isVerified) {
        res.status(403);
        return res.json({
          statusCode: 403,
          success: false,
          message: "Please verify your email before logging in.",
        });
      }

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

// ===========================================================
//                    VERIFY OTP CONTROLLER
// ===========================================================
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(422);
      return res.json({
        statusCode: 422,
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      return res.json({
        statusCode: 404,
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      res.status(400);
      return res.json({
        statusCode: 400,
        success: false,
        message: "Account is already verified. Please login.",
      });
    }

    if (user.verificationOtp !== otp) {
      res.status(400);
      return res.json({
        statusCode: 400,
        success: false,
        message: "Invalid verification code",
      });
    }

    if (new Date() > user.verificationOtpExpires) {
      res.status(400);
      return res.json({
        statusCode: 400,
        success: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    user.isVerified = true;
    user.verificationOtp = null;
    user.verificationOtpExpires = null;

    const accessToken = generateToken(user._id);
    user.accessToken = accessToken;
    await user.save();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Account verified successfully",
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
  } catch (error) {
    next(error);
  }
};

// ===========================================================
//                    RESEND OTP CONTROLLER
// ===========================================================
export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(422);
      return res.json({
        statusCode: 422,
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      return res.json({
        statusCode: 404,
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      res.status(400);
      return res.json({
        statusCode: 400,
        success: false,
        message: "Account is already verified",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.verificationOtp = otp;
    user.verificationOtpExpires = otpExpires;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Verify your email - Aevum",
      text: `Your new verification OTP code is: ${otp}. It will expire in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #4F46E5; text-align: center;">Welcome to Aevum!</h2>
          <p>Here is your new 6-digit verification code to complete your registration:</p>
          <div style="background-color: #F3F4F6; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 15px; margin: 20px 0; border-radius: 6px; color: #1F2937;">
            ${otp}
          </div>
          <p style="color: #6B7280; font-size: 14px;">This code is valid for 15 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Verification OTP resent successfully",
    });
  } catch (error) {
    next(error);
  }
};
