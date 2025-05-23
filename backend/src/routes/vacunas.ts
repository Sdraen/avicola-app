import express from "express"
import { authenticateToken } from "../middleware/auth"
import {
  getAllVacunas,
  getVacunaById,
  createVacuna,
  updateVacuna,
  deleteVacuna,
  aplicarVacuna,
  getVacunaAplicaciones,
  searchVacunas,
} from "../controllers/vacunasController"

const router = express.Router()

router.get("/", authenticateToken, getAllVacunas)
router.get("/search/:query", authenticateToken, searchVacunas)
router.get("/aplicaciones/:id_vacuna", authenticateToken, getVacunaAplicaciones)
router.get("/:id", authenticateToken, getVacunaById)
router.post("/", authenticateToken, createVacuna)
router.post("/aplicar", authenticateToken, aplicarVacuna)
router.put("/:id", authenticateToken, updateVacuna)
router.delete("/:id", authenticateToken, deleteVacuna)

export default router
