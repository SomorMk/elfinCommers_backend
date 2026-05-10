import User from "../models/User.model.js";

// ===========================================================
//               GET PROFILE INFO CONTROLLER
// ===========================================================
export const getProfileInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      res.status(404);
      return res.json({
        statusCode: 404,
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Profile details fetched successfully",
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
//               UPDATE PROFILE INFO CONTROLLER
// ===========================================================
export const updateProfileInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      return res.json({
        statusCode: 404,
        success: false,
        message: "User not found",
      });
    }

    const { username, mobile } = req.body;

    if (username) user.username = username;
    if (mobile) user.mobile = mobile;

    if (req.file) {
      user.profilePicture = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Profile updated successfully",
      data: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        status: updatedUser.status,
        profilePicture: updatedUser.profilePicture,
      },
    });
  } catch (error) {
    next(error);
  }
};
