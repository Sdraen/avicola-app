import express from "express"
import { authenticateToken } from "../middleware/auth"
import {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  getClienteVentas,
  searchClientes,
  getClientesStats,
} from "../controllers/clientesController"

const router = express.Router()

router.get("/", authenticateToken, getAllClientes)
router.get("/stats/overview", authenticateToken, getClientesStats)
router.get("/search/:query", authenticateToken, searchClientes)
router.get("/:id", authenticateToken, getClienteById)
router.get("/:id/ventas", authenticateToken, getClienteVentas)
router.post("/", authenticateToken, createCliente)
router.put("/:id", authenticateToken, updateCliente)
router.delete("/:id", authenticateToken, deleteCliente)

export default router
