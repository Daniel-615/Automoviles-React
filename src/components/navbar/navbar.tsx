"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import "../css/navbar.css"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const location = useLocation()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
    setActiveDropdown(null)
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-icon"></span>
          <span className="logo-text">AUTOVENTAS</span>
        </Link>

        {/* Desktop Menu */}
        <div className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
          <Link to="/" className={`navbar-item ${isActive("/") ? "active" : ""}`} onClick={closeMenu}>
            Home
          </Link>

          {/* Gestión Dropdown */}
          <div className="navbar-dropdown">
            <button className="navbar-item dropdown-toggle" onClick={() => toggleDropdown("gestion")}>
              Gestión <span className="dropdown-arrow">▼</span>
            </button>
            <div className={`dropdown-menu ${activeDropdown === "gestion" ? "active" : ""}`}>
              <div className="dropdown-section">
                <h4>Clientes</h4>
                <Link to="/cliente" onClick={closeMenu}>
                  Nuevo Cliente
                </Link>
                <Link to="/clientes" onClick={closeMenu}>
                  Lista Clientes
                </Link>
                <Link to="/cliente-segmento" onClick={closeMenu}>
                  Cliente-Segmento
                </Link>
                <Link to="/lista-cliente-segmento" onClick={closeMenu}>
                  Lista Cliente-Segmento
                </Link>
              </div>
              <div className="dropdown-section">
                <h4>Vendedores</h4>
                <Link to="/vendedor" onClick={closeMenu}>
                  Nuevo Vendedor
                </Link>
                <Link to="/vendedores" onClick={closeMenu}>
                  Lista Vendedores
                </Link>
                <Link to="/vendedor_tienda" onClick={closeMenu}>
                  Vendedor-Tienda
                </Link>
                <Link to="/lista-vendedor-tienda" onClick={closeMenu}>
                  Lista Vendedor-Tienda
                </Link>
              </div>
              <div className="dropdown-section">
                <h4>Gerentes</h4>
                <Link to="/gerentes" onClick={closeMenu}>
                  Nuevo Gerente
                </Link>
                <Link to="/lista-gerentes" onClick={closeMenu}>
                  Lista Gerentes
                </Link>
              </div>
            </div>
          </div>

          {/* Ubicaciones Dropdown */}
          <div className="navbar-dropdown">
            <button className="navbar-item dropdown-toggle" onClick={() => toggleDropdown("ubicaciones")}>
              Ubicaciones <span className="dropdown-arrow">▼</span>
            </button>
            <div className={`dropdown-menu ${activeDropdown === "ubicaciones" ? "active" : ""}`}>
              <div className="dropdown-section">
                <h4>Regiones</h4>
                <Link to="/region" onClick={closeMenu}>
                  Nueva Región
                </Link>
                <Link to="/lista-regiones" onClick={closeMenu}>
                  Lista Regiones
                </Link>
              </div>
              <div className="dropdown-section">
                <h4>Ciudades</h4>
                <Link to="/ciudades" onClick={closeMenu}>
                  Nueva Ciudad
                </Link>
                <Link to="/lista-ciudades" onClick={closeMenu}>
                  Lista Ciudades
                </Link>
              </div>
              <div className="dropdown-section">
                <h4>Tiendas</h4>
                <Link to="/tiendas" onClick={closeMenu}>
                  Nueva Tienda
                </Link>
                <Link to="/lista-tiendas" onClick={closeMenu}>
                  Lista Tiendas
                </Link>
              </div>
              <div className="dropdown-section">
                <h4>Segmentos</h4>
                <Link to="/segmentos" onClick={closeMenu}>
                  Nuevo Segmento
                </Link>
                <Link to="/lista-segmentos" onClick={closeMenu}>
                  Lista Segmentos
                </Link>
              </div>
            </div>
          </div>

          {/* Productos Dropdown */}
          <div className="navbar-dropdown">
            <button className="navbar-item dropdown-toggle" onClick={() => toggleDropdown("productos")}>
              Productos <span className="dropdown-arrow">▼</span>
            </button>
            <div className={`dropdown-menu ${activeDropdown === "productos" ? "active" : ""}`}>
              <div className="dropdown-section">
                <h4>Categorías</h4>
                <Link to="/categoria" onClick={closeMenu}>
                  Nueva Categoría
                </Link>
                <Link to="/lista-categorias" onClick={closeMenu}>
                  Lista Categorías
                </Link>
              </div>
              <div className="dropdown-section">
                <h4>Marcas</h4>
                <Link to="/marca" onClick={closeMenu}>
                  Nueva Marca
                </Link>
                <Link to="/lista-marcas" onClick={closeMenu}>
                  Lista Marcas
                </Link>
              </div>
              <div className="dropdown-section">
                <h4>Modelos</h4>
                <Link to="/modelo" onClick={closeMenu}>
                  Nuevo Modelo
                </Link>
                <Link to="/lista-modelos" onClick={closeMenu}>
                  Lista Modelos
                </Link>
              </div>
              <div className="dropdown-section">
                <h4>Productos</h4>
                <Link to="/producto" onClick={closeMenu}>
                  Nuevo Producto
                </Link>
                <Link to="/lista-productos" onClick={closeMenu}>
                  Lista Productos
                </Link>
              </div>
            </div>
          </div>

          {/* Ventas Dropdown */}
          <div className="navbar-dropdown">
            <button className="navbar-item dropdown-toggle" onClick={() => toggleDropdown("ventas")}>
              Ventas <span className="dropdown-arrow">▼</span>
            </button>
            <div className={`dropdown-menu ${activeDropdown === "ventas" ? "active" : ""}`}>
              <div className="dropdown-section">
                <h4>Transacciones</h4>
                <Link to="/ventas" onClick={closeMenu}>
                  Nueva Venta
                </Link>
                <Link to="/lista-ventas" onClick={closeMenu}>
                  Lista Ventas
                </Link>
              </div>
              <div className="dropdown-section">
                <h4>Fechas</h4>
                <Link to="/fecha" onClick={closeMenu}>
                  Nueva Fecha
                </Link>
                <Link to="/lista-fechas" onClick={closeMenu}>
                  Lista Fechas
                </Link>
              </div>
            </div>
          </div>

          {/* Reportes */}
          <Link to="/tiendasBi" className={`navbar-item ${isActive("/tiendasBi") ? "active" : ""}`} onClick={closeMenu}>
            Reportes
          </Link>
        </div>

        {/* CTA Button */}
        <Link to="/ventas" className="navbar-cta" onClick={closeMenu}>
          GET STARTED
        </Link>

        {/* Mobile Menu Toggle */}
        <button className="navbar-toggle" onClick={toggleMenu}>
          <span className={`hamburger ${isMenuOpen ? "active" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMenuOpen && <div className="navbar-overlay" onClick={closeMenu}></div>}
    </nav>
  )
}

export default Navbar
