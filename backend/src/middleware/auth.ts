import type { Request, Response, NextFunction } from "express"
import { supabase } from "../config/supabase"

export interface AuthenticatedRequest extends Request {
  user?: any
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      res.status(401).json({ error: "Access token required" })
      return
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      res.status(403).json({ error: "Invalid or expired token" })
      return
    }

    req.user = user
    next()
  } catch (error) {
    res.status(500).json({ error: "Authentication error" })
  }
}
