import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import { validateAdvanced } from "../middleware/universalValidator"
import {
  getAllRegistrosHuevos,
  createRegistroHuevos,
  getRegistroHuevosByDateRange,
  getEstadisticasHuevos,
} from "../controllers/registroHuevosController"

const router = express.Router()

// Admin y Operador pueden leer
router.get("/", authenticateToken, requireRole(["admin", "operador"]), getAllRegistrosHuevos)
router.get("/stats", authenticateToken, requireRole(["admin", "operador"]), getEstadisticasHuevos)
router.get("/fecha/:start/:end", authenticateToken, requireRole(["admin", "operador"]), getRegistroHuevosByDateRange)

// Admin y Operador pueden crear (con validaciones)
router.post(
  "/",
  authenticateToken,
  requireRole(["admin", "operador"]),
  validateAdvanced("registro_huevos"),
  createRegistroHuevos,
)

export default router
