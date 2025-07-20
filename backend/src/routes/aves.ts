import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import {
  getAllAves,
  getAveById,
  createAve,
  updateAve,
  deleteAve,
  getAvesByJaula,
  getAvesStats,
  reactivarAve,
} from "../controllers/avesController"

const router = express.Router()

// Admin y Operador pueden leer
router.get("/", authenticateToken, requireRole(["admin", "operador"]), getAllAves)
router.get("/stats/overview", authenticateToken, requireRole(["admin", "operador"]), getAvesStats)
router.get("/jaula/:id_jaula", authenticateToken, requireRole(["admin", "operador"]), getAvesByJaula)
router.get("/:id", authenticateToken, requireRole(["admin", "operador"]), getAveById)

// Admin y Operador pueden crear
router.post("/", authenticateToken, requireRole(["admin", "operador"]), createAve)

// Admin y Operador pueden actualizar
router.put("/:id", authenticateToken, requireRole(["admin", "operador"]), updateAve)

// Solo Admin puede eliminar
router.delete("/:id", authenticateToken, requireRole(["admin"]), deleteAve)

// Solo Admin puede reactivar ave
// Esto es para reactivar aves que fueron marcadas como fallecidas (soft delete)
router.patch("/:id/reactivar", authenticateToken, requireRole(["admin"]), reactivarAve)

export default router
