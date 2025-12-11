import express from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCourseMatrix,
  seedCourses,
} from "../controllers/courseController.js";
import { getCourseReport } from "../controllers/reportController.js";

const router = express.Router();

// CREATE
router.post("/create", createCourse);

// SEED (get existing courses or seed sample)
router.post("/seed", seedCourses);

// GET ALL
router.get("/", getCourses);

// Course MÜDEK matrix - Spesifik route, :id'den önce
router.get("/:id/matrix", getCourseMatrix);

// Course MÜDEK raporu - Spesifik route, :id'den önce
router.get("/:id/report", getCourseReport);

// GET ONE - Genel route en sonda
router.get("/:id", getCourseById);

// UPDATE
router.put("/:id", updateCourse);

// DELETE
router.delete("/:id", deleteCourse);

export default router;
