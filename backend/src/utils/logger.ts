import fs from "fs"
import path from "path"

enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
}

class Logger {
  private logDir: string
  private logFile: string
  private debugMode: boolean

  constructor() {
    this.logDir = process.env.LOG_DIR || "logs"
    this.logFile = path.join(this.logDir, `app-${new Date().toISOString().split("T")[0]}.log`)
    this.debugMode = process.env.NODE_ENV === "development"

    // Create log directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString()
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : ""
    return `[${timestamp}] [${level}] ${message}${metaStr}\n`
  }

  private writeToFile(message: string): void {
    fs.appendFileSync(this.logFile, message)
  }

  private log(level: LogLevel, message: string, meta?: any): void {
    const formattedMessage = this.formatMessage(level, message, meta)

    // Always write to file
    this.writeToFile(formattedMessage)

    // Console output in development mode
    if (this.debugMode) {
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage.trim())
          break
        case LogLevel.WARN:
          console.warn(formattedMessage.trim())
          break
        case LogLevel.DEBUG:
          console.debug(formattedMessage.trim())
          break
        default:
          console.log(formattedMessage.trim())
      }
    }
  }

  info(message: string, meta?: any): void {
    this.log(LogLevel.INFO, message, meta)
  }

  warn(message: string, meta?: any): void {
    this.log(LogLevel.WARN, message, meta)
  }

  error(message: string, meta?: any): void {
    this.log(LogLevel.ERROR, message, meta)
  }

  debug(message: string, meta?: any): void {
    if (this.debugMode) {
      this.log(LogLevel.DEBUG, message, meta)
    }
  }

  // Log API requests
  logRequest(req: any, res: any, responseTime: number): void {
    const meta = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.headers["user-agent"],
      ip: req.ip || req.headers["x-forwarded-for"],
    }
    this.info("API Request", meta)
  }

  // Log database operations
  logDbOperation(operation: string, table: string, duration: number, success: boolean): void {
    this.debug("Database Operation", {
      operation,
      table,
      duration: `${duration}ms`,
      success,
    })
  }
}

export default new Logger()
