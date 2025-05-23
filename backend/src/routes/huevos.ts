import express from "express"
import { authenticateToken } from "../middleware/auth"
import {
  getAllHuevos,
  getHuevoById,
  createHuevo,
  createBulkHuevos,
  updateHuevo,
  deleteHuevo,
  getHuevosByDateRange,
  getHuevosStats,
} from "../controllers/huevosController"

const router = express.Router()

router.get("/", authenticateToken, getAllHuevos)
router.get("/stats/overview", authenticateToken, getHuevosStats)
router.get("/fecha/:start/:end", authenticateToken, getHuevosByDateRange)
router.get("/:id", authenticateToken, getHuevoById)
router.post("/", authenticateToken, createHuevo)
router.post("/bulk", authenticateToken, createBulkHuevos)
router.put("/:id", authenticateToken, updateHuevo)
router.delete("/:id", authenticateToken, deleteHuevo)

export default router
