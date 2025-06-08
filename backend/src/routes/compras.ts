import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import {
  getAllCompras,
  getCompraById,
  createCompra,
  updateCompra,
  deleteCompra,
  getComprasByDateRange,
  getComprasStats,
} from "../controllers/comprasController"

const router = express.Router()

// Admin y Operador pueden leer
router.get("/", authenticateToken, requireRole(["admin", "operador"]), getAllCompras)
router.get("/stats/overview", authenticateToken, requireRole(["admin", "operador"]), getComprasStats)
router.get("/fecha/:start/:end", authenticateToken, requireRole(["admin", "operador"]), getComprasByDateRange)
router.get("/:id", authenticateToken, requireRole(["admin", "operador"]), getCompraById)

// Admin y Operador pueden crear
router.post("/", authenticateToken, requireRole(["admin", "operador"]), createCompra)

// Admin y Operador pueden actualizar
router.put("/:id", authenticateToken, requireRole(["admin", "operador"]), updateCompra)

// Solo Admin puede eliminar
router.delete("/:id", authenticateToken, requireRole(["admin"]), deleteCompra)

export default router
