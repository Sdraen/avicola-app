import express from "express"
import { authenticateToken } from "../middleware/auth"
import {
  getAllAves,
  getAveById,
  createAve,
  updateAve,
  deleteAve,
  getAvesByJaula,
  getAvesStats,
} from "../controllers/avesController"

const router = express.Router()

router.get("/", authenticateToken, getAllAves)
router.get("/stats/overview", authenticateToken, getAvesStats)
router.get("/jaula/:id_jaula", authenticateToken, getAvesByJaula)
router.get("/:id", authenticateToken, getAveById)
router.post("/", authenticateToken, createAve)
router.put("/:id", authenticateToken, updateAve)
router.delete("/:id", authenticateToken, deleteAve)

export default router
