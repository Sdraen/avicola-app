import express from "express"
import { authenticateToken, requireRole } from "../middleware/auth"
import {
  getHistorialClinico,
  createRegistroClinico,
  updateRegistroClinico,
  registrarFallecimiento,
  getAvesFallecidas,
  eliminarRegistroClinico,
  eliminarFallecimiento,
} from "../controllers/aveClinicaController"

const router = express.Router()

// Rutas para historial clínico
router.get("/historial/:id", authenticateToken, requireRole(["admin", "operador"]), getHistorialClinico)
router.post("/", authenticateToken, requireRole(["admin", "operador"]), createRegistroClinico)
router.put("/:id", authenticateToken, requireRole(["admin", "operador"]), updateRegistroClinico)
router.delete("/:id", authenticateToken, requireRole(["admin"]), eliminarRegistroClinico)

// Rutas para fallecimientos
router.get("/fallecidas", authenticateToken, requireRole(["admin", "operador"]), getAvesFallecidas)
router.post("/fallecimiento", authenticateToken, requireRole(["admin", "operador"]), registrarFallecimiento)
router.delete("/fallecimiento/:id", authenticateToken, requireRole(["admin"]), eliminarFallecimiento)

export default router
