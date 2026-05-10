import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";

// Routes
import authRoutes from "./routes/auth.routes.js";
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

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
