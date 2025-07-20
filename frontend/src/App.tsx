"use client"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import Layout from "./components/Layout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"

// Aves
import Aves from "./pages/Aves"
import VerAves from "./pages/VerAves"
import RegistrarAve from "./pages/RegistrarAve"
import VerAvesFallecidas from "./pages/VerAvesFallecidas"

// Huevos
import Huevos from "./pages/Huevos"
import VerHuevos from "./pages/VerHuevos"
import RegistrarHuevos from "./pages/RegistrarHuevos"

// Bandejas
import VerBandejas from "./pages/VerBandejas"

// Jaulas
import Jaulas from "./pages/Jaulas"
import VerJaulas from "./pages/VerJaulas"
import RegistrarJaula from "./pages/RegistrarJaula"

// Clientes
import Clientes from "./pages/Clientes"
import VerClientes from "./pages/VerClientes"
import RegistrarCliente from "./pages/RegistrarCliente"

// Ventas
import Ventas from "./pages/Ventas"
import VerVentas from "./pages/VerVentas"
import RegistrarVenta from "./pages/RegistrarVenta"

// Compras
import Compras from "./pages/Compras"
import VerCompras from "./pages/VerCompras"
import RegistrarCompra from "./pages/RegistrarCompra"

// Medicamentos
import Medicamentos from "./pages/Medicamentos"
import VerMedicamentos from "./pages/VerMedicamentos"
import RegistrarMedicamento from "./pages/RegistrarMedicamento"

// Vacunas
import Vacunas from "./pages/Vacunas"
import VerVacunas from "./pages/VerVacunas"
import RegistrarVacuna from "./pages/RegistrarVacuna"

// Incubación
import Incubacion from "./pages/Incubacion"
import VerIncubacion from "./pages/VerIncubacion"
import RegistrarIncubacion from "./pages/RegistrarIncubacion"

// Implementos
import Implementos from "./pages/Implementos"
import VerImplementos from "./pages/VerImplementos"
import RegistrarImplemento from "./pages/RegistrarImplemento"

// Razas
import Razas from "./pages/Razas"

import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Rutas de Aves */}
        <Route path="aves" element={<Aves />} />
        <Route path="ver-aves" element={<VerAves />} />
        <Route path="registrar-ave" element={<RegistrarAve />} />
        <Route path="ver-aves-fallecidas" element={<VerAvesFallecidas />} />

        {/* Rutas de Huevos */}
        <Route path="huevos" element={<Huevos />} />
        <Route path="ver-huevos" element={<VerHuevos />} />
        <Route path="registrar-huevos" element={<RegistrarHuevos />} />
        {/* Rutas de Bandejas */}
        <Route path="ver-bandejas" element={<VerBandejas />} />

        {/* Rutas de Jaulas */}
        <Route path="jaulas" element={<Jaulas />} />
        <Route path="ver-jaulas" element={<VerJaulas />} />
        <Route path="registrar-jaula" element={<RegistrarJaula />} />

        {/* Rutas de Clientes */}
        <Route path="clientes" element={<Clientes />} />
        <Route path="ver-clientes" element={<VerClientes />} />
        <Route path="registrar-cliente" element={<RegistrarCliente />} />

        {/* Rutas de Ventas */}
        <Route path="ventas" element={<Ventas />} />
        <Route path="ver-ventas" element={<VerVentas />} />
        <Route path="registrar-venta" element={<RegistrarVenta />} />

        {/* Rutas de Compras */}
        <Route path="compras" element={<Compras />} />
        <Route path="ver-compras" element={<VerCompras />} />
        <Route path="registrar-compra" element={<RegistrarCompra />} />

        {/* Rutas de Medicamentos */}
        <Route path="medicamentos" element={<Medicamentos />} />
        <Route path="ver-medicamentos" element={<VerMedicamentos />} />
        <Route path="registrar-medicamento" element={<RegistrarMedicamento />} />

        {/* Rutas de Vacunas */}
        <Route path="vacunas" element={<Vacunas />} />
        <Route path="ver-vacunas" element={<VerVacunas />} />
        <Route path="registrar-vacuna" element={<RegistrarVacuna />} />

        {/* Rutas de Incubación */}
        <Route path="incubacion" element={<Incubacion />} />
        <Route path="ver-incubacion" element={<VerIncubacion />} />
        <Route path="registrar-incubacion" element={<RegistrarIncubacion />} />

        {/* Rutas de Implementos */}
        <Route path="implementos" element={<Implementos />} />
        <Route path="ver-implementos" element={<VerImplementos />} />
        <Route path="registrar-implemento" element={<RegistrarImplemento />} />

        {/* Rutas de Razas */}
        <Route path="razas" element={<Razas />} />
      </Route>
    </Routes>
  )
}

export default App
