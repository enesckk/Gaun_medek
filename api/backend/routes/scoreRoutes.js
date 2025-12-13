import express from "express";
import {
  submitScore,
  getScoresByStudent,
  getScoresByExam,
  getScoresByStudentForExam,
  calculateLOAchievement,
  calculatePOAchievement,
} from "../controllers/scoreController.js";

const router = express.Router();

// POST /api/scores/submit
router.post("/submit", submitScore);

// GET /api/scores/student/:studentId
router.get("/student/:studentId", getScoresByStudent);

// GET /api/scores/exam/:examId
router.get("/exam/:examId", getScoresByExam);

// GET /api/scores/student/:studentId/exam/:examId
router.get("/student/:studentId/exam/:examId", getScoresByStudentForExam);

// POST /api/scores/lo-achievement
router.post("/lo-achievement", calculateLOAchievement);

// POST /api/scores/po-achievement
router.post("/po-achievement", calculatePOAchievement);

export default router;

