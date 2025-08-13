import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import { createNacimiento, getNacimientoById } from "../controllers/nacimientosController"

const router = express.Router()

// Registrar nacimiento (admin y operador)
router.post("/", authenticateToken, requireRole(["admin", "operador"]), createNacimiento)

// Ver detalle de nacimiento (admin y operador)
router.get("/:id", authenticateToken, requireRole(["admin", "operador"]), getNacimientoById)

export default router
