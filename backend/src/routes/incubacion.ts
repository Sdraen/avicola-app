import express from "express"
import { authenticateToken } from "../middleware/auth"
import {
  getAllIncubaciones,
  getIncubacionById,
  createIncubacion,
  updateIncubacion,
  deleteIncubacion,
  getActiveIncubaciones,
  getIncubacionesByIncubadora,
  getIncubacionStats,
} from "../controllers/incubacionController"

const router = express.Router()

router.get("/", authenticateToken, getAllIncubaciones)
router.get("/stats/overview", authenticateToken, getIncubacionStats)
router.get("/estado/activo", authenticateToken, getActiveIncubaciones)
router.get("/incubadora/:id_incubadora", authenticateToken, getIncubacionesByIncubadora)
router.get("/:id", authenticateToken, getIncubacionById)
router.post("/", authenticateToken, createIncubacion)
router.put("/:id", authenticateToken, updateIncubacion)
router.delete("/:id", authenticateToken, deleteIncubacion)

export default router
