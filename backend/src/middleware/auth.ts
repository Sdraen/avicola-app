import type { Request, Response, NextFunction } from "express"
import { supabase } from "../config/supabase"

export interface AuthenticatedRequest extends Request {
  user?: any
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      res.status(401).json({ error: "Access token required" })
      return
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      res.status(403).json({ error: "Invalid or expired token" })
      return
    }
    ;(req as AuthenticatedRequest).user = user
    next()
  } catch (error) {
    res.status(500).json({ error: "Authentication error" })
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

      // Get user role from database
      const { data: userData, error } = await supabase
        .from("usuario")
        .select("rol")
        .eq("correo", authenticatedReq.user.email)
        .single()

      if (error || !userData) {
        res.status(403).json({ error: "User role not found" })
        return
      }

      if (!roles.includes(userData.rol)) {
        res.status(403).json({ error: "Insufficient permissions" })
        return
      }

      next()
    } catch (error) {
      res.status(500).json({ error: "Authorization error" })
    }
  }
}
