import express from "express"
import { authenticateToken } from "../middleware/auth"
import {
  getAllImplementos,
  getImplementoById,
  createImplemento,
  updateImplemento,
  deleteImplemento,
  getImplementosByCompra,
  searchImplementos,
  getImplementosStats,
} from "../controllers/implementosController"

const router = express.Router()

router.get("/", authenticateToken, getAllImplementos)
router.get("/stats/overview", authenticateToken, getImplementosStats)
router.get("/search/:query", authenticateToken, searchImplementos)
router.get("/compra/:id_compras", authenticateToken, getImplementosByCompra)
router.get("/:id", authenticateToken, getImplementoById)
router.post("/", authenticateToken, createImplemento)
router.put("/:id", authenticateToken, updateImplemento)
router.delete("/:id", authenticateToken, deleteImplemento)

export default router
