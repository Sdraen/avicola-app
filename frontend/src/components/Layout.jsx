// src/components/Layout.jsx
import Sidebar from "./Sidebar"
import { Outlet } from "react-router-dom"
import "../styles/Layout.css"

const Layout = () => {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
