import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import {
  getAllVentas,
  getVentaById,
  createVenta,
  updateVenta,
  deleteVenta,
  getVentasByDateRange,
  getVentasStats,
} from "../controllers/ventasController"

const router = express.Router()

// Admin y Operador pueden leer
router.get("/", authenticateToken, requireRole(["admin", "operador"]), getAllVentas)
router.get("/stats/overview", authenticateToken, requireRole(["admin", "operador"]), getVentasStats)
router.get("/fecha/:start/:end", authenticateToken, requireRole(["admin", "operador"]), getVentasByDateRange)
router.get("/:id", authenticateToken, requireRole(["admin", "operador"]), getVentaById)

// Admin y Operador pueden crear
router.post("/", authenticateToken, requireRole(["admin", "operador"]), createVenta)

// Admin y Operador pueden actualizar
router.put("/:id", authenticateToken, requireRole(["admin", "operador"]), updateVenta)

// Solo Admin puede eliminar
router.delete("/:id", authenticateToken, requireRole(["admin"]), deleteVenta)

export default router
