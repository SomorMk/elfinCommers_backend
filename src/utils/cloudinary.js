import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Bulletproof configuration parsing of CLOUDINARY_URL
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (cloudinaryUrl) {
  try {
    const cleanUrl = cloudinaryUrl.replace("cloudinary://", "");
    const [credentials, cloudName] = cleanUrl.split("@");
    const [apiKey, apiSecret] = credentials.split(":");

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    console.log("✅ Cloudinary Configured Successfully for cloud:", cloudName);
  } catch (error) {
    console.error(
      "❌ Failed to parse CLOUDINARY_URL explicitly, trying default config...",
      error,
    );
    cloudinary.config();
  }
} else {
  console.warn("⚠️ CLOUDINARY_URL environment variable is missing!");
  cloudinary.config();
}

/**
 * Uploads a file to Cloudinary and deletes the local temporary copy.
 * @param {string} localFilePath - Path to the file stored locally
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<string>} The secure URL of the uploaded image
 */
export const uploadToCloudinary = async (
  localFilePath,
  folder = "products",
) => {
  try {
    if (!localFilePath) {
      console.warn("⚠️ uploadToCloudinary called without localFilePath");
      return null;
    }

    console.log(
      `⏳ Uploading ${localFilePath} to Cloudinary folder '${folder}'...`,
    );

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: folder,
    });

    console.log("✅ Cloudinary upload success! URL:", response.secure_url);

    // Successfully uploaded - remove local temporary file
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      console.log(`🧹 Deleted local temp file: ${localFilePath}`);
    }

    return response.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error);
    // Clean up local temporary file even if the upload failed
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      console.log(
        `🧹 Cleaned up local temp file after failed upload: ${localFilePath}`,
      );
    }
    throw error;
  }
};
