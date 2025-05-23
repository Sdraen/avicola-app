import type { Request, Response, NextFunction } from "express"
import logger from "../utils/logger"

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()

  // Log when the request completes
  res.on("finish", () => {
    const duration = Date.now() - start
    logger.logRequest(req, res, duration)
  })

  next()
}
