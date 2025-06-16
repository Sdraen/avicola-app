import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
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

// Admin y Operador pueden leer
router.get("/", authenticateToken, requireRole(["admin", "operador"]), getAllIncubaciones)
router.get("/stats/overview", authenticateToken, requireRole(["admin", "operador"]), getIncubacionStats)
router.get("/estado/activo", authenticateToken, requireRole(["admin", "operador"]), getActiveIncubaciones)
router.get(
  "/incubadora/:id_incubadora",
  authenticateToken,
  requireRole(["admin", "operador"]),
  getIncubacionesByIncubadora,
)
router.get("/:id", authenticateToken, requireRole(["admin", "operador"]), getIncubacionById)

// Admin y Operador pueden crear
router.post("/", authenticateToken, requireRole(["admin", "operador"]), createIncubacion)

// Admin y Operador pueden actualizar
router.put("/:id", authenticateToken, requireRole(["admin", "operador"]), updateIncubacion)

// Solo Admin puede eliminar
router.delete("/:id", authenticateToken, requireRole(["admin"]), deleteIncubacion)

export default router
