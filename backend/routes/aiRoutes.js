import express from "express";
import { processExam, upload } from "../controllers/aiController.js";

const router = express.Router();

// POST /api/ai/process
router.post("/process", upload.single("file"), processExam);

export default router;

