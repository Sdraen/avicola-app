import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import { validacionAvanzada } from "../middleware/advancedValidator"
import {
  getAllAves,
  getAveById,
  createAve,
  updateAve,
  deleteAve,
  getAvesByJaula,
  getAvesStats,
} from "../controllers/avesController"

const router = express.Router()

// Admin y Operador pueden leer
router.get("/", authenticateToken, requireRole(["admin", "operador"]), getAllAves)
router.get("/stats/overview", authenticateToken, requireRole(["admin", "operador"]), getAvesStats)
router.get("/jaula/:id_jaula", authenticateToken, requireRole(["admin", "operador"]), getAvesByJaula)
router.get("/:id", authenticateToken, requireRole(["admin", "operador"]), getAveById)

// Admin y Operador pueden crear (con validaciones avanzadas)
router.post(
  "/",
  authenticateToken,
  requireRole(["admin", "operador"]),
  validacionAvanzada("ave"), // ← Nueva validación
  createAve,
)

// Admin y Operador pueden actualizar (con validaciones avanzadas)
router.put(
  "/:id",
  authenticateToken,
  requireRole(["admin", "operador"]),
  validacionAvanzada("ave"), // ← Nueva validación
  updateAve,
)

// Solo Admin puede eliminar
router.delete("/:id", authenticateToken, requireRole(["admin"]), deleteAve)

export default router
