import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// CORS configuration - Frontend URL'ini allow et
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Same-origin requests veya allowed origins
    // Production'da sadece FRONTEND_URL'e izin ver
    // Development'ta localhost'a izin ver
    if (!origin || allowedOrigins.some(allowed => origin.startsWith(allowed)) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
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

// Render veya lokal için server'ı başlat
async function startServer() {
  if (!MONGO_URI) {
    console.error("❌ MONGODB_URI (veya MONGO_URI) tanımlı değil. .env dosyanızı kontrol edin.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, {
      dbName: MONGODB_DB,
      serverSelectionTimeoutMS: 10000,
      bufferCommands: true,
      maxPoolSize: 10,
      minPoolSize: 1,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log("✅ MongoDB bağlantısı kuruldu");
    console.log(`📊 Veritabanı: ${MONGODB_DB}`);

    const serverPort = process.env.PORT || PORT;
    app.listen(serverPort, () =>
      console.log(`🚀 Backend running on port ${serverPort}`)
    );
  } catch (err) {
    console.error("❌ MongoDB bağlantı hatası:", err.message);
    
    if (err.message.includes("ECONNREFUSED") || err.message.includes("connect")) {
      console.error("\n💡 MongoDB servisi çalışmıyor. Lütfen MongoDB'yi başlatın:");
      console.error("   Windows: Yönetici olarak PowerShell açın ve şu komutu çalıştırın:");
      console.error("   Start-Service -Name MongoDB");
      console.error("\n   Veya Windows Services (services.msc) üzerinden 'MongoDB Server' servisini başlatın.");
      console.error(`\n   Bağlantı URI: ${MONGO_URI}`);
    }
    
    process.exit(1);
  }
}

// Server'ı başlat
startServer();
