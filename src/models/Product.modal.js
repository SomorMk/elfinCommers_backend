import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },

    discountPrice: {
      type: Number,
      default: 0,
      min: [0, "Discount price cannot be negative"],
    },

    images: {
      type: [String],
      required: [true, "At least one product image is required"],
      default: [],
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },

    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    brand: {
      type: String,
      required: [true, "Product brand is required"],
      trim: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["in-stock", "out-of-stock", "not-available"],
      default: "in-stock",
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  },
);

// Generate unique slug
productSchema.pre("save", async function () {
  if (this.isModified("title")) {
    let baseSlug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    let slug = baseSlug;

    const ProductModel = this.constructor;
    let exists = await ProductModel.findOne({
      slug,
      _id: { $ne: this._id },
    });

    if (exists) {
      const suffix = Math.random().toString(36).substring(2, 7);
      this.slug = `${baseSlug}-${suffix}`;
    } else {
      this.slug = slug;
    }
  }
});

const Product = mongoose.model("Product", productSchema);

export default Product;
