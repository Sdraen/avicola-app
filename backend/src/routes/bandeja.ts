import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import {
  crearBandeja,
  obtenerBandejas,
  obtenerBandejaPorId,
  obtenerHuevosDisponibles,
  actualizarBandeja,
  eliminarBandeja,
  asignarHuevosABandeja,
  eliminarHuevosDeBandeja,
} from "../controllers/bandejaController"

const router = express.Router()

// 🔍 Obtener bandejas (admin y operador)
router.get("/", authenticateToken, requireRole(["admin", "operador"]), obtenerBandejas)
router.get("/:id", authenticateToken, requireRole(["admin", "operador"]), obtenerBandejaPorId)

// ➕ Crear bandeja (admin y operador)
router.post("/", authenticateToken, requireRole(["admin", "operador"]), crearBandeja)

// 🔍 Obtener huevos disponibles (admin y operador)
router.get("/huevos-disponibles/:tipo/:tamaño", authenticateToken, requireRole(["admin", "operador"]), obtenerHuevosDisponibles)


// ✏️ Editar bandeja (admin y operador)
router.put("/:id", authenticateToken, requireRole(["admin", "operador"]), actualizarBandeja)

// 🗑️ Eliminar bandeja (solo admin)
router.delete("/:id", authenticateToken, requireRole(["admin"]), eliminarBandeja)

// 🔁 Asignar huevos a bandeja (admin y operador)
router.post("/:id/asignar", authenticateToken, requireRole(["admin", "operador"]), asignarHuevosABandeja)

// ❌ Eliminar huevos de bandeja (admin)
router.post("/:id/eliminar-huevos", authenticateToken, requireRole(["admin"]), eliminarHuevosDeBandeja)

export default router
