import express from "express";
import {
  createQuestion,
  getQuestionsByExam,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionController.js";

const router = express.Router();

// POST /api/questions/
router.post("/", createQuestion);

// GET /api/questions/exam/:examId
router.get("/exam/:examId", getQuestionsByExam);

// GET /api/questions/:id
router.get("/:id", getQuestionById);

// PUT /api/questions/:id
router.put("/:id", updateQuestion);

// DELETE /api/questions/:id
router.delete("/:id", deleteQuestion);

export default router;

