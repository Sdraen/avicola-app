import express from "express"
import { authenticateToken } from "../middleware/auth"
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

router.get("/", authenticateToken, getAllJaulas)
router.get("/stats/overview", authenticateToken, getJaulasStats)
router.get("/estanque/:id_estanque", authenticateToken, getJaulasByEstanque)
router.get("/:id", authenticateToken, getJaulaById)
router.post("/", authenticateToken, createJaula)
router.post("/:id/hygiene", authenticateToken, addHygieneService)
router.put("/:id", authenticateToken, updateJaula)
router.delete("/:id", authenticateToken, deleteJaula)

export default router
