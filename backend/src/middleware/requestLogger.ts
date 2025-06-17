import type { Request, Response, NextFunction } from "express"
import logger from "../utils/logger"

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now()

  // Log the incoming request
  logger.info(`📥 ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  })

  // Log the response when it finishes
  res.on("finish", () => {
    const responseTime = Date.now() - start
    const logLevel = res.statusCode >= 400 ? "error" : "info"

    logger[logLevel](`📤 ${req.method} ${req.originalUrl} - ${res.statusCode} (${responseTime}ms)`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    })
  })

  next()
}
