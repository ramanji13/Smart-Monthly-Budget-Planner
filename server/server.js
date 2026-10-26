
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";

import transactionRoutes from "./routes/transactionRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import summaryRoutes from "./routes/summaryRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDistPath = path.resolve(__dirname, "../client/dist");

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/summary", summaryRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected"
  });
});

// Serve the built React frontend
app.use(express.static(clientDistPath));

// Send React's index.html for frontend routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  res.sendFile(
    path.join(clientDistPath, "index.html"),
    (error) => {
      if (error) next(error);
    }
  );
});

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from the .env file");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log("MongoDB Atlas connected successfully");

    app.listen(PORT, () => {
      console.log(`Application running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
