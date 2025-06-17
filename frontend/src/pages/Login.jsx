"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/Login.css"

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulación de autenticación (puedes reemplazar con llamada real al backend)
      await simulateLogin(formData.email, formData.password)

      // Guardar estado de autenticación
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("userEmail", formData.email)

      // Redirigir al dashboard
      navigate("/", { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Función que simula la autenticación
  const simulateLogin = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Credenciales de prueba (puedes cambiarlas)
        const validCredentials = [
          { email: "admin@avicola.com", password: "123456" },
          { email: "usuario@test.com", password: "password" },
          { email: formData.email, password: "123" }, // Acepta cualquier email con password "123"
        ]

        const isValid = validCredentials.some((cred) => cred.email === email && cred.password === password)

        if (isValid) {
          resolve({ success: true })
        } else {
          reject(new Error("Credenciales incorrectas"))
        }
      }, 1500) // Simula delay de red
    })
  }

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleSubmit}>
        <div className="login-header">
          <div className="login-icon">🔐</div>
          <h2 className="login-title">Iniciar Sesión</h2>
          <p className="login-subtitle">Accede a tu cuenta para continuar</p>
        </div>

        <div className="form-content">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email" className="input-label">
              <span className="label-icon">📧</span>
              Correo Electrónico
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">
              <span className="label-icon">🔒</span>
              Contraseña
            </label>
            <div className="input-wrapper">
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button type="submit" className={`login-button ${isLoading ? "loading" : ""}`} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="loading-spinner">⏳</span>
                <span className="button-text">Ingresando...</span>
              </>
            ) : (
              <>
                <span className="button-icon">🚀</span>
                <span className="button-text">Ingresar</span>
              </>
            )}
          </button>

          <div className="login-help">
            <p className="help-text">
              <strong>Credenciales de prueba:</strong>
              <br />📧 admin@avicola.com | 🔒 123456
              <br />📧 cualquier@email.com | 🔒 123
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Login
