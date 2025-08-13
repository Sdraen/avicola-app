import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import {
  getIncubaciones,
  getIncubacionById,
  createIncubacion,
  updateIncubacion,
  cambiarEstadoIncubacion,
  deleteIncubacion,
  getStatsIncubaciones,

  // Incubadoras (máquinas)
  getIncubadoras,
  createIncubadora,
  updateIncubadora,
  deleteIncubadora,
} from "../controllers/incubacionesController"

const router = express.Router()

// Listado y estadísticas (admin y operador)
router.get("/", authenticateToken, requireRole(["admin", "operador"]), getIncubaciones)
router.get("/stats", authenticateToken, requireRole(["admin", "operador"]), getStatsIncubaciones)

// ---- Incubadoras (máquinas) ----
// ⚠️ Estas rutas deben ir antes de "/:id"
router.get("/incubadoras", authenticateToken, requireRole(["admin", "operador"]), getIncubadoras)
router.post("/incubadoras", authenticateToken, requireRole(["admin"]), createIncubadora)
router.put("/incubadoras/:id", authenticateToken, requireRole(["admin"]), updateIncubadora)
router.delete("/incubadoras/:id", authenticateToken, requireRole(["admin"]), deleteIncubadora)

// Detalle (admin y operador)
router.get("/:id", authenticateToken, requireRole(["admin", "operador"]), getIncubacionById)

// Crear / Editar (admin y operador)
router.post("/", authenticateToken, requireRole(["admin", "operador"]), createIncubacion)
router.put("/:id", authenticateToken, requireRole(["admin", "operador"]), updateIncubacion)

// Cambiar estado (admin y operador)
router.patch("/:id/estado", authenticateToken, requireRole(["admin", "operador"]), cambiarEstadoIncubacion)

// Eliminar (solo admin, y si no tiene nacimiento)
router.delete("/:id", authenticateToken, requireRole(["admin"]), deleteIncubacion)

export default router
