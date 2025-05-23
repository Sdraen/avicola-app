import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import dotenv from "dotenv"

// Import routes
import authRoutes from "./routes/auth"
import avesRoutes from "./routes/aves"
import huevosRoutes from "./routes/huevos"
import incubacionRoutes from "./routes/incubacion"
import ventasRoutes from "./routes/ventas"
import jaulasRoutes from "./routes/jaulas"
import clientesRoutes from "./routes/clientes"
import implementosRoutes from "./routes/implementos"
import medicamentosRoutes from "./routes/medicamentos"
import vacunasRoutes from "./routes/vacunas"
import comprasRoutes from "./routes/compras"

// Import middleware
import { errorLogger, errorResponder, invalidPathHandler } from "./middleware/errorHandler"
import { sanitizeInput } from "./middleware/validator"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Global middleware
app.use(sanitizeInput)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Poultry Farm API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/aves", avesRoutes)
app.use("/api/huevos", huevosRoutes)
app.use("/api/incubacion", incubacionRoutes)
app.use("/api/ventas", ventasRoutes)
app.use("/api/jaulas", jaulasRoutes)
app.use("/api/clientes", clientesRoutes)
app.use("/api/implementos", implementosRoutes)
app.use("/api/medicamentos", medicamentosRoutes)
app.use("/api/vacunas", vacunasRoutes)
app.use("/api/compras", comprasRoutes)

// Error handling middleware
app.use(errorLogger)
app.use(errorResponder)
app.use(invalidPathHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`)
})

export default app
