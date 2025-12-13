import express from "express";
import multer from "multer";
import {
  createExam,
  getExamsByCourse,
  getExamById,
  updateExam,
  deleteExam,
  submitExamScores,
  getExamResults,
  startBatchScore,
  getBatchStatus,
} from "../controllers/examController.js";
import { getExamAnalysis } from "../controllers/reportController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// CREATE - Spesifik route'lar önce gelmeli
router.post("/create", createExam);
// Backward compatibility
router.post("/", createExam);

// GET /api/exams/course/:courseId - Spesifik route, :id'den önce
router.get("/course/:courseId", getExamsByCourse);

// Score submission (PDF upload or base64) - Spesifik route, :id'den önce
router.post("/:examId/score", upload.single("file"), submitExamScores);
// Batch score (multiple PDFs) - Spesifik route, :id'den önce
router.post("/:examId/batch-score", upload.array("files"), startBatchScore);
router.get("/:examId/batch-status", getBatchStatus);

// Results list - Spesifik route, :id'den önce
router.get("/:examId/results", getExamResults);
// Analysis (MÜDEK) - Spesifik route, :id'den önce
router.get("/:id/analysis", getExamAnalysis);

// GET /api/exams/:id - Genel route en sonda
router.get("/:id", getExamById);

// PUT /api/exams/:id
router.put("/:id", updateExam);

// DELETE /api/exams/:id
router.delete("/:id", deleteExam);

export default router;

