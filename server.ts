import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDB } from "./backend/src/config/db";

// Import Routes
import authRoutes from "./backend/src/routes/auth";
import citizenRoutes from "./backend/src/routes/citizen";
import adminRoutes from "./backend/src/routes/admin";
import commonRoutes from "./backend/src/routes/common";
import { runSeeders } from "./backend/src/database/seeders";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Database Connection
  await connectDB();
  await runSeeders();

  // Basic Middleware
  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Static for uploads
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  // Static for site assets (favicon/logo)
  app.use("/assets", express.static(path.join(process.cwd(), "assets")));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Digital Municipality System API is live." });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/citizen", citizenRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/common", commonRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
