import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import {
  getAllImplementos,
  getImplementoById,
  createImplemento,
  updateImplemento,
  deleteImplemento,
  getImplementosByCompra,
  searchImplementos,
  getImplementosStats,
} from "../controllers/implementosController"

const router = express.Router()

// Admin y Operador pueden leer
router.get("/", authenticateToken, requireRole(["admin", "operador"]), getAllImplementos)
router.get("/stats/overview", authenticateToken, requireRole(["admin", "operador"]), getImplementosStats)
router.get("/search/:query", authenticateToken, requireRole(["admin", "operador"]), searchImplementos)
router.get("/compra/:id_compras", authenticateToken, requireRole(["admin", "operador"]), getImplementosByCompra)
router.get("/:id", authenticateToken, requireRole(["admin", "operador"]), getImplementoById)

// Admin y Operador pueden crear
router.post("/", authenticateToken, requireRole(["admin", "operador"]), createImplemento)

// Admin y Operador pueden actualizar
router.put("/:id", authenticateToken, requireRole(["admin", "operador"]), updateImplemento)

// Solo Admin puede eliminar
router.delete("/:id", authenticateToken, requireRole(["admin"]), deleteImplemento)

export default router
