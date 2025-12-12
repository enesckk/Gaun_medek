import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Static file serving for debug images
// Vercel'de /tmp, lokal'de __dirname/temp kullan
const isVercel = process.env.VERCEL === "1";
const debugImagesPath = isVercel 
  ? path.join("/tmp", "exam_crops")
  : path.join(__dirname, "temp", "exam_crops");
// Vercel'de static file serving çalışmaz, sadece lokal'de
if (!isVercel) {
  app.use("/api/debug-images", express.static(debugImagesPath));
}

// Debug endpoint to list available images
app.get("/api/debug-images-list", (req, res) => {
  try {
    const fs = require("fs");
    if (!fs.existsSync(debugImagesPath)) {
      return res.json({ success: false, message: "Debug images directory does not exist", path: debugImagesPath });
    }
    const files = fs.readdirSync(debugImagesPath).filter(f => f.endsWith('.png'));
    res.json({ 
      success: true, 
      path: debugImagesPath,
      count: files.length,
      files: files.slice(0, 20) // İlk 20 dosyayı göster
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// API key durumunu kontrol et
app.get("/api/check-api-key", (req, res) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const googleKey = process.env.GOOGLE_API_KEY;
  const apiKey = geminiKey || googleKey;
  
  const info = {
    geminiApiKeyFound: !!geminiKey,
    googleApiKeyFound: !!googleKey,
    apiKeyFound: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : "BULUNAMADI",
    apiKeyStartsWithAIza: apiKey ? apiKey.startsWith("AIza") : false,
    hasQuotes: apiKey ? (apiKey.includes('"') || apiKey.includes("'")) : false,
    envFileLocation: ".env dosyası backend klasöründe olmalı"
  };
  
  res.json({ success: true, data: info });
});

// Gemini API test endpoint
app.get("/api/test-gemini", async (req, res) => {
  try {
    const { testGeminiAPI, listGeminiModels } = await import("./utils/geminiVision.js");
    
    // Önce mevcut modelleri listele
    console.log("📋 Mevcut modelleri listeliyor...");
    const modelList = await listGeminiModels();
    
    // Sonra test et
    const result = await testGeminiAPI();
    
    res.json({ 
      success: true, 
      data: {
        ...result,
        availableModels: modelList
      }
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

// Import all routes
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

// Mount all routes
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

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const MONGODB_DB = process.env.MONGODB_DB || "mudek";

async function startServer() {
  if (!MONGO_URI) {
    console.error("❌ MONGODB_URI (veya MONGO_URI) tanımlı değil. .env dosyanızı kontrol edin.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, {
      dbName: MONGODB_DB, // Veritabanı adı
      serverSelectionTimeoutMS: 10000,
      // Veri kaybını önlemek için önemli ayarlar
      bufferCommands: true, // Bağlantı yokken komutları buffer'la
      maxPoolSize: 10, // Maksimum bağlantı sayısı
      minPoolSize: 1, // Minimum bağlantı sayısı
      socketTimeoutMS: 45000, // Socket timeout
      family: 4, // IPv4 kullan
    });
    console.log("✅ MongoDB bağlantısı kuruldu");
    console.log(`📊 Veritabanı: ${MONGODB_DB}`);

    // Bağlantı olaylarını dinle
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB bağlantı hatası:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB bağlantısı kesildi');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB yeniden bağlandı');
    });

    // Vercel serverless function için app.listen kullanmıyoruz
    // Sadece lokal geliştirme için
    if (process.env.VERCEL !== "1") {
      app.listen(PORT, () =>
        console.log(`Backend running at http://localhost:${PORT}`)
      );
    } else {
      console.log("✅ Backend Vercel serverless function olarak çalışıyor");
    }
  } catch (err) {
    console.error("❌ MongoDB bağlantı hatası:", err.message);
    
    // ECONNREFUSED hatası MongoDB servisinin çalışmadığını gösterir
    if (err.message.includes("ECONNREFUSED") || err.message.includes("connect")) {
      console.error("\n💡 MongoDB servisi çalışmıyor. Lütfen MongoDB'yi başlatın:");
      console.error("   Windows: Yönetici olarak PowerShell açın ve şu komutu çalıştırın:");
      console.error("   Start-Service -Name MongoDB");
      console.error("\n   Veya Windows Services (services.msc) üzerinden 'MongoDB Server' servisini başlatın.");
      console.error(`\n   Bağlantı URI: ${MONGO_URI}`);
    }
    
    if (process.env.VERCEL !== "1") {
      process.exit(1);
    }
  }
}

// MongoDB connection cache (Vercel serverless functions için)
let cachedConnection = null;

// Vercel serverless function için MongoDB bağlantısını ensure eden middleware
async function ensureMongoConnection() {
  if (cachedConnection) {
    return cachedConnection;
  }

  const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
  const MONGODB_DB = process.env.MONGODB_DB || "mudek";

  if (!MONGO_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  try {
    // Zaten bağlı mı kontrol et
    if (mongoose.connection.readyState === 1) {
      cachedConnection = mongoose.connection;
      return cachedConnection;
    }

    // Bağlantıyı kur
    await mongoose.connect(MONGO_URI, {
      dbName: MONGODB_DB,
      serverSelectionTimeoutMS: 10000,
      bufferCommands: true,
      maxPoolSize: 10,
      minPoolSize: 1,
      socketTimeoutMS: 45000,
      family: 4,
    });

    cachedConnection = mongoose.connection;
    console.log("✅ MongoDB bağlantısı kuruldu (Vercel serverless)");
    return cachedConnection;
  } catch (error) {
    console.error("❌ MongoDB bağlantı hatası:", error);
    throw error;
  }
}

// Express middleware: Her request'te MongoDB bağlantısını kontrol et
app.use(async (req, res, next) => {
  if (process.env.VERCEL === "1") {
    try {
      await ensureMongoConnection();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: error.message,
      });
    }
  }
  next();
});

// Vercel serverless function için export
if (process.env.VERCEL === "1") {
  // Vercel'de sadece log yaz, bağlantı middleware'de yapılacak
  console.log("✅ Backend Vercel serverless function olarak çalışıyor");
} else {
  // Lokal geliştirme için normal başlat
  startServer();
}

// Express app'i export et (Vercel serverless function için)
export default app;
