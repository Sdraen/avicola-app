import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { supabase } from "../config/supabase"

export interface AuthenticatedRequest extends Request {
  user?: any
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1]

    console.log("🔍 Auth Header:", authHeader)
    console.log("🎫 Token:", token ? token.substring(0, 20) + "..." : "No token")

    if (!token) {
      console.log("❌ No token provided")
      res.status(401).json({ error: "Access token required" })
      return
    }

    // Verificar el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    console.log("✅ Token decoded:", { userId: decoded.userId, email: decoded.email, rol: decoded.rol })

    // Buscar el usuario en la base de datos
    const { data: userData, error } = await supabase
      .from("usuario")
      .select("*")
      .eq("id_usuario", decoded.userId)
      .single()

    if (error || !userData) {
      console.log("❌ User not found in database:", error)
      res.status(403).json({ error: "Invalid or expired token" })
      return
    }

    console.log("✅ User authenticated:", userData.correo)
    ;(req as AuthenticatedRequest).user = userData
    next()
  } catch (error) {
    console.error("❌ Authentication error:", error)
    res.status(403).json({ error: "Invalid or expired token" })
  }
}

export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authenticatedReq = req as AuthenticatedRequest

      if (!authenticatedReq.user) {
        res.status(401).json({ error: "User not authenticated" })
        return
      }

      if (!roles.includes(authenticatedReq.user.rol)) {
        res.status(403).json({ error: "Insufficient permissions" })
        return
      }

      next()
    } catch (error) {
      res.status(500).json({ error: "Authorization error" })
    }
  }
}
