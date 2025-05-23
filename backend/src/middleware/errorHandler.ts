import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
  RequestHandler,
} from "express"
import { sendServerError } from "../utils/responseHelper"


export const errorLogger: ErrorRequestHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  })
  next(err)
}


export const errorResponder: ErrorRequestHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === "development"

  if (err.name === "PostgrestError") {
    res.status(400).json({
      error: "Database error",
      message: isDev ? err.message : "An error occurred with the database operation",
    })
    return
  }

  sendServerError(res, isDev ? err.message : "Internal server error")
}


export const invalidPathHandler: RequestHandler = (req, res) => {
  res.status(404).json({ error: "Path not found" })
}
