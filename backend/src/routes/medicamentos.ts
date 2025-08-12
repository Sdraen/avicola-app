import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import {
  getAllMedicamentos,
  getMedicamentoById,
  createMedicamento,
  updateMedicamento,
  deleteMedicamento,
} from "../controllers/medicamentosController"

const router = express.Router()

// Lectura: Admin y Operador
router.get("/", authenticateToken, requireRole(["admin", "operador"]), getAllMedicamentos)
router.get("/:id", authenticateToken, requireRole(["admin", "operador"]), getMedicamentoById)

// Crear/Actualizar: Admin y Operador
router.post("/", authenticateToken, requireRole(["admin", "operador"]), createMedicamento)
router.put("/:id", authenticateToken, requireRole(["admin", "operador"]), updateMedicamento)

// Eliminar: solo Admin (y solo si no está usado)
router.delete("/:id", authenticateToken, requireRole(["admin"]), deleteMedicamento)

export default router
