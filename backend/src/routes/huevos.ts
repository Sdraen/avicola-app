import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import {
  getAllHuevos,
  getHuevoById,
  createHuevo,
  createBulkHuevos,
  updateHuevo,
  deleteHuevo,
  getHuevosByDateRange,
  getHuevosByJaula,
  getHuevosStats,
} from "../controllers/huevosController"

const router = express.Router()

// Admin y Operador pueden leer
router.get("/", authenticateToken, requireRole(["admin", "operador"]), getAllHuevos)
router.get("/stats/overview", authenticateToken, requireRole(["admin", "operador"]), getHuevosStats)
router.get("/fecha/:start/:end", authenticateToken, requireRole(["admin", "operador"]), getHuevosByDateRange)
router.get("/jaula/:id_jaula", authenticateToken, requireRole(["admin", "operador"]), getHuevosByJaula)
router.get("/:id", authenticateToken, requireRole(["admin", "operador"]), getHuevoById)

// Admin y Operador pueden crear
router.post("/", authenticateToken, requireRole(["admin", "operador"]), createHuevo)
router.post("/bulk", authenticateToken, requireRole(["admin", "operador"]), createBulkHuevos)

// Admin y Operador pueden actualizar
router.put("/:id", authenticateToken, requireRole(["admin", "operador"]), updateHuevo)

// Solo Admin puede eliminar
router.delete("/:id", authenticateToken, requireRole(["admin"]), deleteHuevo)

export default router
