import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import {
  getAllVacunas,
  getVacunaById,
  createVacuna,
  updateVacuna,
  deleteVacuna,
} from "../controllers/vacunasController"

const router = express.Router()

// Lectura: Admin y Operador
router.get("/", authenticateToken, requireRole(["admin", "operador"]), getAllVacunas)
router.get("/:id", authenticateToken, requireRole(["admin", "operador"]), getVacunaById)

// Crear/Actualizar: Admin y Operador
router.post("/", authenticateToken, requireRole(["admin", "operador"]), createVacuna)
router.put("/:id", authenticateToken, requireRole(["admin", "operador"]), updateVacuna)

// Eliminar: solo Admin (y solo si no está usada)
router.delete("/:id", authenticateToken, requireRole(["admin"]), deleteVacuna)

export default router
