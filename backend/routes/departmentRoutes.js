import express from "express";
import { getDepartments, seedDepartments } from "../controllers/departmentController.js";

const router = express.Router();

router.get("/", getDepartments);
router.post("/seed", seedDepartments);

export default router;

