import express from "express"
import {
  register,
  login,
  logout,
  getCurrentUser,
  checkRoleAvailability,
  checkEmailAvailability,
} from "../controllers/authController"

const router = express.Router()

// Rutas públicas (no requieren autenticación)
router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.get("/me", getCurrentUser)
router.get("/roles/availability", checkRoleAvailability)
router.get("/email/check/:email", checkEmailAvailability)

export default router
