import express from "express";
import {
  getProgramOutcomesByProgram,
  getProgramOutcomesByDepartment,
  addProgramOutcome,
  addProgramOutcomeToDepartment,
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

// GET /api/program-outcomes - Get all program outcomes (aggregated from all departments)
// Must be FIRST to avoid conflict with /:departmentId route
router.get("/", getProgramOutcomes);

// Program-based PÇ management (new - preferred)
// GET /api/program-outcomes/program/:programId
router.get("/program/:programId", getProgramOutcomesByProgram);

// POST /api/program-outcomes/program/:programId/add
router.post("/program/:programId/add", addProgramOutcome);

// PUT /api/program-outcomes/program/:programId/update
router.put("/program/:programId/update", updateProgramOutcomes);

// DELETE /api/program-outcomes/program/:programId/delete
router.delete("/program/:programId/delete", deletePO);

// Department-based PÇ management
// GET /api/program-outcomes/:departmentId
router.get("/:departmentId", getProgramOutcomesByDepartment);

// POST /api/program-outcomes/:departmentId/add
router.post("/:departmentId/add", addProgramOutcomeToDepartment);

// Legacy endpoints (for backward compatibility)
router.post("/", createProgramOutcome);
router.get("/legacy/:id", getProgramOutcomeById);
router.put("/legacy/:id", updateProgramOutcome);
router.delete("/legacy/:id", deleteProgramOutcome);

export default router;

