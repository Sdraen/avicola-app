import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import { getAllRazas, createRaza, updateRaza, deleteRaza } from "../controllers/razasController"

const router = express.Router()

// Todos pueden leer razas
router.get("/", authenticateToken, requireRole(["admin", "operador"]), getAllRazas)

// Solo Admin puede gestionar razas
router.post("/", authenticateToken, requireRole(["admin"]), createRaza)
router.put("/:id", authenticateToken, requireRole(["admin"]), updateRaza)
router.delete("/:id", authenticateToken, requireRole(["admin"]), deleteRaza)

export default router
