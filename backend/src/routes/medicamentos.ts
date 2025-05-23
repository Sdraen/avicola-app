import express from "express"
import { authenticateToken } from "../middleware/auth"
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

router.get("/", authenticateToken, getAllMedicamentos)
router.get("/search/:query", authenticateToken, searchMedicamentos)
router.get("/aplicaciones/:id_medicamento", authenticateToken, getMedicamentoAplicaciones)
router.get("/:id", authenticateToken, getMedicamentoById)
router.post("/", authenticateToken, createMedicamento)
router.post("/aplicar", authenticateToken, aplicarMedicamento)
router.put("/:id", authenticateToken, updateMedicamento)
router.delete("/:id", authenticateToken, deleteMedicamento)

export default router
