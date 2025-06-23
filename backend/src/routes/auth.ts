import { Router } from "express"
import {
  register,
  login,
  logout,
  getCurrentUser,
  checkRoleAvailability,
  checkEmailAvailability,
} from "../controllers/authController"
import { authenticateToken } from "../middleware/auth"

const router = Router()

// Rutas públicas
router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.get("/roles/availability", checkRoleAvailability)
router.get("/email/check/:email", checkEmailAvailability)

// Rutas protegidas
router.get("/verify", authenticateToken, getCurrentUser)
router.get("/me", authenticateToken, getCurrentUser) // Alias para verificar token

export default router
