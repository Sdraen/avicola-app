import express from "express"
import { authenticateToken } from "../middleware/auth"
import {
  getAllCompras,
  getCompraById,
  createCompra,
  updateCompra,
  deleteCompra,
  getComprasByDateRange,
  getComprasStats,
} from "../controllers/comprasController"

const router = express.Router()

router.get("/", authenticateToken, getAllCompras)
router.get("/stats/overview", authenticateToken, getComprasStats)
router.get("/fecha/:start/:end", authenticateToken, getComprasByDateRange)
router.get("/:id", authenticateToken, getCompraById)
router.post("/", authenticateToken, createCompra)
router.put("/:id", authenticateToken, updateCompra)
router.delete("/:id", authenticateToken, deleteCompra)

export default router
