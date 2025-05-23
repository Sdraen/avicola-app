import express from "express"
import { register, login, logout, getCurrentUser } from "../controllers/authController"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.get("/me", getCurrentUser)

export default router
