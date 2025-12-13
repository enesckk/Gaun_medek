import express from "express";
import {
  createStudent,
  getStudents,
  getStudentById,
  getStudentByNumber,
  updateStudent,
  deleteStudent,
} from "../controllers/studentController.js";

const router = express.Router();

// POST /api/students/
router.post("/", createStudent);

// GET /api/students/
router.get("/", getStudents);

// GET /api/students/id/:id
router.get("/id/:id", getStudentById);

// GET /api/students/num/:studentNumber
router.get("/num/:studentNumber", getStudentByNumber);

// PUT /api/students/:id
router.put("/:id", updateStudent);

// DELETE /api/students/:id
router.delete("/:id", deleteStudent);

export default router;

