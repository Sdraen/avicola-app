import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  getClienteVentas,
  searchClientes,
  getClientesStats,
} from "../controllers/clientesController"

const router = express.Router()

// Admin y Operador pueden leer
router.get("/", authenticateToken, requireRole(["admin", "operador"]), getAllClientes)
router.get("/stats/overview", authenticateToken, requireRole(["admin", "operador"]), getClientesStats)
router.get("/search/:query", authenticateToken, requireRole(["admin", "operador"]), searchClientes)
router.get("/:id", authenticateToken, requireRole(["admin", "operador"]), getClienteById)
router.get("/:id/ventas", authenticateToken, requireRole(["admin", "operador"]), getClienteVentas)

// Admin y Operador pueden crear
router.post("/", authenticateToken, requireRole(["admin", "operador"]), createCliente)

// Admin y Operador pueden actualizar
router.put("/:id", authenticateToken, requireRole(["admin", "operador"]), updateCliente)

// Solo Admin puede eliminar
router.delete("/:id", authenticateToken, requireRole(["admin"]), deleteCliente)

export default router
