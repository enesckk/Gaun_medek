import express from "express";
import {
  getProgramOutcomesByDepartment,
  addProgramOutcome,
  updateProgramOutcomes,
  deleteProgramOutcome as deletePO,
  // Legacy endpoints (kept for backward compatibility)
  createProgramOutcome,
  getProgramOutcomes,
  getProgramOutcomeById,
  updateProgramOutcome,
  deleteProgramOutcome,
} from "../controllers/programOutcomeController.js";

const router = express.Router();

// Department-based PÇ management
// GET /api/program-outcomes/:departmentId
router.get("/:departmentId", getProgramOutcomesByDepartment);

// POST /api/program-outcomes/:departmentId/add
router.post("/:departmentId/add", addProgramOutcome);

// PUT /api/program-outcomes/:departmentId/update
router.put("/:departmentId/update", updateProgramOutcomes);

// DELETE /api/program-outcomes/:departmentId/delete
router.delete("/:departmentId/delete", deletePO);

// Legacy endpoints (for backward compatibility)
router.post("/", createProgramOutcome);
router.get("/", getProgramOutcomes);
router.get("/legacy/:id", getProgramOutcomeById);
router.put("/legacy/:id", updateProgramOutcome);
router.delete("/legacy/:id", deleteProgramOutcome);

export default router;

