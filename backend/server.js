import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const isVercel = process.env.VERCEL === "1";

// CORS (istersen daha sıkı hale getirebiliriz)
app.use(
  cors({
    origin: true, // dev'de kolaylık; prod’da domain listesi vermek daha iyi
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

/* -------------------------------
   MongoDB connection (Vercel-safe)
--------------------------------- */
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const MONGODB_DB = process.env.MONGODB_DB || "mudek";

let cachedConnPromise = null;

async function connectMongoOnce() {
  if (!MONGO_URI) throw new Error("MONGODB_URI (veya MONGO_URI) tanımlı değil");

  // Zaten bağlıysa direkt dön
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  // Aynı anda birden fazla istek gelirse tek connect denensin
  if (!cachedConnPromise) {
    cachedConnPromise = mongoose
      .connect(MONGO_URI, {
        dbName: MONGODB_DB,
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
        minPoolSize: 1,
        socketTimeoutMS: 45000,
        family: 4,
      })
      .then(() => {
        console.log("✅ MongoDB connected");
        return mongoose.connection;
      })
      .catch((err) => {
        cachedConnPromise = null; // başarısızsa tekrar denenebilsin
        throw err;
      });
  }

  return cachedConnPromise;
}

// ✅ ÖNEMLİ: bunu route’lardan ÖNCE koy
app.use(async (req, res, next) => {
  if (!isVercel) return next(); // lokalde bağlantıyı startServer halledecek

  try {
    await connectMongoOnce();
    next();
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

/* -------------------------------
   Debug images (local only)
--------------------------------- */
const debugImagesPath = isVercel
  ? path.join("/tmp", "exam_crops")
  : path.join(__dirname, "temp", "exam_crops");

if (!isVercel) {
  app.use("/api/debug-images", express.static(debugImagesPath));
}

app.get("/api/debug-images-list", (req, res) => {
  try {
    if (!fs.existsSync(debugImagesPath)) {
      return res.json({
        success: false,
        message: "Debug images directory does not exist",
        path: debugImagesPath,
      });
    }
    const files = fs.readdirSync(debugImagesPath).filter((f) => f.endsWith(".png"));
    res.json({
      success: true,
      path: debugImagesPath,
      count: files.length,
      files: files.slice(0, 20),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* -------------------------------
   Health & info endpoints
--------------------------------- */
app.get("/api/health", (req, res) => res.json({ status: "OK" }));

app.get("/api/check-api-key", (req, res) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const googleKey = process.env.GOOGLE_API_KEY;
  const apiKey = geminiKey || googleKey;

  res.json({
    success: true,
    data: {
      geminiApiKeyFound: !!geminiKey,
      googleApiKeyFound: !!googleKey,
      apiKeyFound: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      apiKeyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : "BULUNAMADI",
      apiKeyStartsWithAIza: apiKey ? apiKey.startsWith("AIza") : false,
      hasQuotes: apiKey ? apiKey.includes('"') || apiKey.includes("'") : false,
      envFileLocation: ".env dosyası backend klasöründe olmalı",
    },
  });
});

app.get("/api/test-gemini", async (req, res) => {
  try {
    const { testGeminiAPI, listGeminiModels } = await import("./utils/geminiVision.js");
    const modelList = await listGeminiModels();
    const result = await testGeminiAPI();

    res.json({
      success: true,
      data: { ...result, availableModels: modelList },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend API is running",
    endpoints: {
      health: "/api/health",
      courses: "/api/courses",
    },
  });
});

/* -------------------------------
   Routes
--------------------------------- */
import courseRoutes from "./routes/courseRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import programOutcomeRoutes from "./routes/programOutcomeRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import learningOutcomeRoutes from "./routes/learningOutcomeRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import scoreRoutes from "./routes/scoreRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";

app.use("/api/courses", courseRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/program-outcomes", programOutcomeRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/learning-outcomes", learningOutcomeRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/assessments", assessmentRoutes);

/* -------------------------------
   Local listen only
--------------------------------- */
const PORT = process.env.PORT || 5000;

async function startLocal() {
  await connectMongoOnce();

  mongoose.connection.on("error", (err) => console.error("❌ MongoDB error:", err));
  mongoose.connection.on("disconnected", () => console.warn("⚠️ MongoDB disconnected"));
  mongoose.connection.on("reconnected", () => console.log("✅ MongoDB reconnected"));

  app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
}

if (!isVercel) {
  startLocal().catch((err) => {
    console.error("❌ Local start failed:", err.message);
    process.exit(1);
  });
}

export default app;
