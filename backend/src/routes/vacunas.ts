import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
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

// Admin y Operador pueden leer
router.get("/", authenticateToken, requireRole(["admin", "operador"]), getAllVacunas)
router.get("/search/:query", authenticateToken, requireRole(["admin", "operador"]), searchVacunas)
router.get("/aplicaciones/:id_vacuna", authenticateToken, requireRole(["admin", "operador"]), getVacunaAplicaciones)
router.get("/:id", authenticateToken, requireRole(["admin", "operador"]), getVacunaById)

// Admin y Operador pueden crear y aplicar
router.post("/", authenticateToken, requireRole(["admin", "operador"]), createVacuna)
router.post("/aplicar", authenticateToken, requireRole(["admin", "operador"]), aplicarVacuna)

// Admin y Operador pueden actualizar
router.put("/:id", authenticateToken, requireRole(["admin", "operador"]), updateVacuna)

// Solo Admin puede eliminar
router.delete("/:id", authenticateToken, requireRole(["admin"]), deleteVacuna)

export default router
