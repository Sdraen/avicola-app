import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import {
  getAllMedicamentos,
  getMedicamentoById,
  createMedicamento,
  updateMedicamento,
  deleteMedicamento,
  aplicarMedicamento,
  getMedicamentoAplicaciones,
  searchMedicamentos,
} from "../controllers/medicamentosController"

const router = express.Router()

// Admin y Operador pueden leer
router.get("/", authenticateToken, requireRole(["admin", "operador"]), getAllMedicamentos)
router.get("/search/:query", authenticateToken, requireRole(["admin", "operador"]), searchMedicamentos)
router.get(
  "/aplicaciones/:id_medicamento",
  authenticateToken,
  requireRole(["admin", "operador"]),
  getMedicamentoAplicaciones,
)
router.get("/:id", authenticateToken, requireRole(["admin", "operador"]), getMedicamentoById)

// Admin y Operador pueden crear y aplicar
router.post("/", authenticateToken, requireRole(["admin", "operador"]), createMedicamento)
router.post("/aplicar", authenticateToken, requireRole(["admin", "operador"]), aplicarMedicamento)

// Admin y Operador pueden actualizar
router.put("/:id", authenticateToken, requireRole(["admin", "operador"]), updateMedicamento)

// Solo Admin puede eliminar
router.delete("/:id", authenticateToken, requireRole(["admin"]), deleteMedicamento)

export default router
