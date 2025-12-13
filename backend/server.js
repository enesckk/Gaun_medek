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
  'https://gaun-mudek.vercel.app', // Vercel frontend URL (hardcoded)
].filter(Boolean);

console.log('🔒 CORS Allowed Origins:', allowedOrigins);
console.log('🔒 FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('🔒 NODE_ENV:', process.env.NODE_ENV);

app.use(cors({
  origin: function (origin, callback) {
    // Same-origin requests (no origin header) - allow
    if (!origin) {
      console.log('✅ CORS: No origin header, allowing');
      return callback(null, true);
    }
    
    console.log('🌐 CORS Request from origin:', origin);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Origin in allowed list');
      return callback(null, true);
    }
    
    // Development mode: allow all origins
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ CORS: Development mode, allowing all');
      return callback(null, true);
    }
    
    // Production: allow vercel.app and onrender.com domains (for flexibility)
    if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
      console.log('✅ CORS: Vercel/Render domain detected, allowing');
      return callback(null, true);
    }
    
    // Also check if origin starts with https://gaun-mudek (any subdomain)
    if (origin.startsWith('https://gaun-mudek')) {
      console.log('✅ CORS: gaun-mudek domain detected, allowing');
      return callback(null, true);
    }
    
    console.log('❌ CORS: Blocked origin:', origin);
    console.log('❌ CORS: Allowed origins:', allowedOrigins);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
