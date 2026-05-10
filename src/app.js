import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";

// Routes
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import blogRoutes from "./routes/blog.routes.js";

// Middleware
import { errorHandler } from "./middlewares/errorHandler.js";

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

// Blog Routes
app.use("/api/blogs", blogRoutes);

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
