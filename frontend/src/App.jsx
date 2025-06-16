// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Jaulas from "./pages/Jaulas"
import RegistrarJaula from "./pages/RegistrarJaula"
import VerJaulas from "./pages/VerJaulas"
import Aves from "./pages/Aves"
import RegistrarAve from "./pages/RegistrarAves"
import VerAves from "./pages/VerAves"
// Nuevas importaciones para el módulo de Huevos
import Huevos from "./pages/Huevos"
import RegistrarHuevos from "./pages/RegistrarHuevos"
import VerHuevos from "./pages/VerHuevos"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />

          {/* Rutas del módulo Jaulas */}
          <Route path="jaulas" element={<Jaulas />} />
          <Route path="registrar-jaula" element={<RegistrarJaula />} />
          <Route path="ver-jaulas" element={<VerJaulas />} />

          {/* Rutas del módulo Aves */}
          <Route path="aves" element={<Aves />} />
          <Route path="registrar-ave" element={<RegistrarAve />} />
          <Route path="ver-aves" element={<VerAves />} />

          {/* Rutas del módulo Huevos */}
          <Route path="huevos" element={<Huevos />} />
          <Route path="registrar-huevos" element={<RegistrarHuevos />} />
          <Route path="ver-huevos" element={<VerHuevos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
