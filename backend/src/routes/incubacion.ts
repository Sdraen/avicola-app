import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import {
  getAllIncubaciones,
  getIncubacionById,
  createIncubacion,
  updateIncubacion,
  deleteIncubacion,
  getActiveIncubaciones,
  getIncubacionesByIncubadora,
  getIncubacionStats,
  registrarNacimientoYCrearAve, // ✅ nueva función importada
} from "../controllers/incubacionController"

const router = express.Router()

// 📄 Obtener incubaciones
router.get("/", authenticateToken, requireRole(["admin", "operador"]), getAllIncubaciones)
router.get("/stats/overview", authenticateToken, requireRole(["admin", "operador"]), getIncubacionStats)
router.get("/estado/activo", authenticateToken, requireRole(["admin", "operador"]), getActiveIncubaciones)
router.get(
  "/incubadora/:id_incubadora",
  authenticateToken,
  requireRole(["admin", "operador"]),
  getIncubacionesByIncubadora
)
router.get("/:id", authenticateToken, requireRole(["admin", "operador"]), getIncubacionById)

// ➕ Crear nueva incubación
router.post("/", authenticateToken, requireRole(["admin", "operador"]), createIncubacion)

// ✅ Registrar nacimiento y crear ave automáticamente
router.post(
  "/nacimiento/crear-ave",
  authenticateToken,
  requireRole(["admin", "operador"]),
  registrarNacimientoYCrearAve
)

// ✏️ Actualizar incubación
router.put("/:id", authenticateToken, requireRole(["admin", "operador"]), updateIncubacion)

// ❌ Eliminar incubación (solo admin)
router.delete("/:id", authenticateToken, requireRole(["admin"]), deleteIncubacion)

export default router
