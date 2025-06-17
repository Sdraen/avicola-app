interface LogEntry {
  timestamp: string
  level: "INFO" | "WARN" | "ERROR"
  message: string
  data?: any
}

class Logger {
  private logs: LogEntry[] = []

  private log(level: "INFO" | "WARN" | "ERROR", message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    }

    this.logs.push(entry)

    // Console output with colors
    const colors = {
      INFO: "\x1b[36m", // Cyan
      WARN: "\x1b[33m", // Yellow
      ERROR: "\x1b[31m", // Red
      RESET: "\x1b[0m",
    }

    console.log(
      `${colors[level]}[${level}]${colors.RESET} ${entry.timestamp} - ${message}`,
      data ? JSON.stringify(data, null, 2) : "",
    )
  }

  info(message: string, data?: any) {
    this.log("INFO", message, data)
  }

  warn(message: string, data?: any) {
    this.log("WARN", message, data)
  }

  error(message: string, data?: any) {
    this.log("ERROR", message, data)
  }

  logDbOperation(operation: string, table: string, duration: number, success: boolean) {
    const message = `DB ${operation} on ${table} - ${duration}ms - ${success ? "SUCCESS" : "FAILED"}`
    this.log(success ? "INFO" : "ERROR", message, { operation, table, duration, success })
  }

  logRequest(req: any, res: any, duration: number) {
    const message = `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    this.log(res.statusCode >= 400 ? "ERROR" : "INFO", message, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
    })
  }

  getLogs() {
    return this.logs
  }

  clearLogs() {
    this.logs = []
  }
}

export default new Logger()
