import express from "express";
import {
  createLearningOutcome,
  getLearningOutcomesByCourse,
  getLearningOutcomeById,
  updateLearningOutcome,
  deleteLearningOutcome,
} from "../controllers/learningOutcomeController.js";

const router = express.Router();

// POST /api/learning-outcomes/
router.post("/", createLearningOutcome);

// GET /api/learning-outcomes/course/:courseId
router.get("/course/:courseId", getLearningOutcomesByCourse);

// GET /api/learning-outcomes/:id
router.get("/:id", getLearningOutcomeById);

// PUT /api/learning-outcomes/:id
router.put("/:id", updateLearningOutcome);

// DELETE /api/learning-outcomes/:id
router.delete("/:id", deleteLearningOutcome);

export default router;

