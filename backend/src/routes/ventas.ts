import express from "express"
import { authenticateToken } from "../middleware/auth"
import {
  getAllVentas,
  getVentaById,
  createVenta,
  updateVenta,
  deleteVenta,
  getVentasByDateRange,
  getVentasStats,
} from "../controllers/ventasController"

const router = express.Router()

router.get("/", authenticateToken, getAllVentas)
router.get("/stats/overview", authenticateToken, getVentasStats)
router.get("/fecha/:start/:end", authenticateToken, getVentasByDateRange)
router.get("/:id", authenticateToken, getVentaById)
router.post("/", authenticateToken, createVenta)
router.put("/:id", authenticateToken, updateVenta)
router.delete("/:id", authenticateToken, deleteVenta)

export default router
