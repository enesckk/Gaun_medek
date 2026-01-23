import express from "express";
import {
  createLearningOutcome,
  getAllLearningOutcomes,
  getLearningOutcomesByCourse,
  getLearningOutcomeById,
  updateLearningOutcome,
  deleteLearningOutcome,
} from "../controllers/learningOutcomeController.js";

const router = express.Router();

// POST /api/learning-outcomes/
router.post("/", createLearningOutcome);

// GET /api/learning-outcomes - Get all learning outcomes (root endpoint)
router.get("/", getAllLearningOutcomes);

// GET /api/learning-outcomes/all (backward compatibility - same as /)
router.get("/all", getAllLearningOutcomes);

// GET /api/learning-outcomes/course/:courseId (must come before /:id)
router.get("/course/:courseId", getLearningOutcomesByCourse);

// GET /api/learning-outcomes/:id
router.get("/:id", getLearningOutcomeById);

// PUT /api/learning-outcomes/:id
router.put("/:id", updateLearningOutcome);

// DELETE /api/learning-outcomes/:id
router.delete("/:id", deleteLearningOutcome);

export default router;

