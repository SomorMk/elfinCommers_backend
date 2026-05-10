import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";

// Routes
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";

// Middleware
import { errorHandler } from "./middlewares/errorHandler.js";
import productRoutes from "./routes/products.routes.js";
import cartRoutes from "./routes/cart.routes.js";

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

// API Routes
app.get("/", (req, res) => {
  res.json({ message: "Production Level Express API" });
});

// Auth Routes
app.use("/api/auth", authRoutes);

// Profile Routes
app.use("/api/profile", profileRoutes);

// Categories Routes
app.use("/api/category", categoriesRoutes);

// Products Routes
app.use("/api/product", productRoutes);

// Cart Routes
app.use("/api/cart", cartRoutes);

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    statusCode: 404,
    success: false,
    message: "Route not found",
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
