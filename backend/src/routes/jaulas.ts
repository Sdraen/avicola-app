import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import {
  getAllJaulas,
  getJaulaById,
  createJaula,
  updateJaula,
  deleteJaula,
  getJaulasByEstanque,
  getJaulasStats,
  addHygieneService,
} from "../controllers/jaulasController"

const router = express.Router()

// Admin y Operador pueden leer
router.get("/", authenticateToken, requireRole(["admin", "operador"]), getAllJaulas)
router.get("/stats/overview", authenticateToken, requireRole(["admin", "operador"]), getJaulasStats)
router.get("/estanque/:id_estanque", authenticateToken, requireRole(["admin", "operador"]), getJaulasByEstanque)
router.get("/:id", authenticateToken, requireRole(["admin", "operador"]), getJaulaById)

// Admin y Operador pueden crear
router.post("/", authenticateToken, requireRole(["admin", "operador"]), createJaula)
router.post("/:id/hygiene", authenticateToken, requireRole(["admin", "operador"]), addHygieneService)

// Admin y Operador pueden actualizar
router.put("/:id", authenticateToken, requireRole(["admin", "operador"]), updateJaula)

// Solo Admin puede eliminar
router.delete("/:id", authenticateToken, requireRole(["admin"]), deleteJaula)

export default router
