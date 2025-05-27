"use client"

import { Suspense, useState, useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import Navbar from "./components/navbar/navbar"
import Tiendas from "./pages/tiendaBi/Tiendas"
import Gerentes from "./pages/gerente/Gerente"
import Cliente from "./pages/cliente/Cliente"
import Ciudad from "./pages/ciudad/Ciudad"
import ClienteSegmento from "./pages/cliente_segmento/ClienteSegmento"
import Region from "./pages/region/Region"
import Segmento from "./pages/segmento/Segmento"
import Tienda from "./pages/tienda/Tienda"
import Vendedor from "./pages/vendedor/Vendedor"
import VendedorTienda from "./pages/vendedor_tienda/vendedor_tienda"
import ListaVendedores from "./pages/vendedor/listaVendedores"
import ListaClientes from "./pages/cliente/ListaClientes"
import ListaSegmentos from "./pages/segmento/ListaSegmentos"
import ListaRegiones from "./pages/region/ListaRegiones"
import ListaCiudades from "./pages/ciudad/ListaCiudades"
import ListaTiendas from "./pages/tienda/ListaTiendas"
import ListaClienteSegmento from "./pages/cliente_segmento/ListaClienteSegmento"
import ListaVendedorTiendas from "./pages/vendedor_tienda/ListasVendedorTiendas"
import ListaGerentes from "./pages/gerente/ListaGerentes"
// Nuevas importaciones para el microservicio de ventas
import Categoria from "./pages/categoria/Categoria"
import ListaCategorias from "./pages/categoria/ListaCategorias"
import Fecha from "./pages/fecha/Fecha"
import ListaFechas from "./pages/fecha/ListaFechas"
import Marca from "./pages/marca/Marca"
import ListaMarcas from "./pages/marca/ListaMarcas"
import Modelo from "./pages/modelo/Modelo"
import ListaModelos from "./pages/modelo/ListaModelos"
import Producto from "./pages/producto/Producto"
import ListaProductos from "./pages/producto/ListaProductos"
import Ventas from "./pages/ventas/Ventas"
import ListaVentas from "./pages/ventas/ListaVentas"
import "./App.css"

// Datos de la aplicación
const estadisticas = [
  { titulo: "Clientes Activos", valor: "1,234", icono: "👥", color: "#dc2626" },
  { titulo: "Tiendas", valor: "45", icono: "🏪", color: "#dc2626" },
  { titulo: "Vendedores", valor: "156", icono: "👨‍💼", color: "#dc2626" },
  { titulo: "Ventas del Mes", valor: "Q 2.5M", icono: "💰", color: "#dc2626" },
]

const caracteristicas = [
  {
    titulo: "Gestión de Clientes",
    descripcion: "Sistema completo para administrar tu base de clientes con segmentación avanzada",
    icono: "👤",
    enlace: "/clientes",
  },
  {
    titulo: "Control de Inventario",
    descripcion: "Gestiona tu inventario de vehículos con categorías, marcas y modelos",
    icono: "🚗",
    enlace: "/lista-productos",
  },
  {
    titulo: "Análisis de Ventas",
    descripcion: "Reportes detallados y análisis en tiempo real de tu rendimiento",
    icono: "📊",
    enlace: "/tiendasBi",
  },
  {
    titulo: "Gestión de Tiendas",
    descripcion: "Administra múltiples ubicaciones y asigna vendedores eficientemente",
    icono: "🏢",
    enlace: "/lista-tiendas",
  },
]

const servicios = [
  {
    titulo: "Gestionar Clientes",
    ruta: "/cliente",
    icono: "👤",
    descripcion: "Crear y editar información de clientes",
  },
  { titulo: "Administrar Tiendas", ruta: "/tiendas", icono: "🏢", descripcion: "Gestión completa de tiendas" },
  { titulo: "Ver Reportes", ruta: "/tiendasBi", icono: "📊", descripcion: "Análisis y estadísticas detalladas" },
  { titulo: "Vendedor-Tienda", ruta: "/vendedor_tienda", icono: "🤝", descripcion: "Asignar vendedores a tiendas" },
  {
    titulo: "Gestionar Productos",
    ruta: "/lista-productos",
    icono: "🚗",
    descripcion: "Catálogo completo de vehículos",
  },
  { titulo: "Registrar Ventas", ruta: "/ventas", icono: "💰", descripcion: "Nueva transacción de venta" },
  { titulo: "Ver Ventas", ruta: "/lista-ventas", icono: "📋", descripcion: "Historial completo de ventas" },
  { titulo: "Marcas y Modelos", ruta: "/lista-marcas", icono: "🏭", descripcion: "Gestión de marcas y modelos" },
]

// Componente de Loading
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
    <p className="loading-text">Cargando...</p>
  </div>
)

// Componente de Error 404
const NotFoundPage = () => (
  <div className="not-found-container">
    <div className="not-found-content">
      <div className="not-found-animation">
        <span className="number">4</span>
        <span className="car-icon">🚗</span>
        <span className="number">4</span>
      </div>
      <h1>Página no encontrada</h1>
      <p>Lo sentimos, la página que buscas no existe o ha sido movida.</p>
      <div className="not-found-actions">
        <a href="/" className="btn-home">
          🏠 Ir al inicio
        </a>
        <button onClick={() => window.history.back()} className="btn-back">
          ← Volver atrás
        </button>
      </div>
      <div className="quick-links">
        <h4>Enlaces útiles:</h4>
        <div className="links-grid">
          <a href="/clientes">👥 Clientes</a>
          <a href="/vendedores">👨‍💼 Vendedores</a>
          <a href="/tiendas">🏪 Tiendas</a>
          <a href="/tiendasBi">📊 Reportes</a>
          <a href="/lista-productos">🚗 Productos</a>
          <a href="/lista-ventas">💰 Ventas</a>
        </div>
      </div>
    </div>
  </div>
)

// Componente de la página de inicio
const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span>Bienvenido a AutoVentas</span>
          </div>

          <h1 className="hero-title">
            Find Your <span className="highlight">Dream Car</span>
            <br />
            With Us
          </h1>

          <p className="hero-subtitle">
            Explore A Vast Collection Of New And Pre-Owned Cars Tailored To Meet Your Driving Needs And Budget
          </p>

          <div className="hero-actions">
            <a href="/lista-productos" className="btn-primary">
              <span>🚗</span>
              EXPLORE MORE
            </a>
            <a href="/tiendasBi" className="btn-secondary">
              <span>📊</span>
              View Reports
            </a>
          </div>

          {/* Search Bar */}
          <div className="search-bar">
            <form className="search-form">
              <div className="form-group">
                <label htmlFor="car-make">Car Make</label>
                <select id="car-make" name="car-make">
                  <option value="">Select Make</option>
                  <option value="toyota">Toyota</option>
                  <option value="honda">Honda</option>
                  <option value="ford">Ford</option>
                  <option value="chevrolet">Chevrolet</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="car-model">Select A Model First</label>
                <select id="car-model" name="car-model">
                  <option value="">Select Model</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="hatchback">Hatchback</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="car-type">Car Type</label>
                <select id="car-type" name="car-type">
                  <option value="">Select Type</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="car-year">Select Year</label>
                <select id="car-year" name="car-year">
                  <option value="">Select Year</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>

              <button type="submit" className="search-btn">
                🔍 Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="stats-section">
        <div className="container">
          <h2 className="section-title">Nuestros Números</h2>
          <p className="section-subtitle">Cifras que demuestran nuestro compromiso con la excelencia</p>
          <div className="stats-grid">
            {estadisticas.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icono}</div>
                <h3 className="stat-value">{stat.valor}</h3>
                <p className="stat-title">{stat.titulo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">¿Por Qué Elegirnos?</h2>
          <p className="section-subtitle">Ofrecemos las mejores herramientas para gestionar tu negocio automotriz</p>
          <div className="features-grid">
            {caracteristicas.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icono}</div>
                <h3 className="feature-title">{feature.titulo}</h3>
                <p className="feature-description">{feature.descripcion}</p>
                <a href={feature.enlace} className="feature-link">
                  Explorar <span>→</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="services-section">
        <div className="container">
          <h2 className="section-title">Nuestros Servicios</h2>
          <p className="section-subtitle">Accede rápidamente a todas las funcionalidades del sistema</p>
          <div className="services-grid">
            {servicios.map((servicio, index) => (
              <a key={index} href={servicio.ruta} className="service-card">
                <div className="service-icon">{servicio.icono}</div>
                <h3 className="service-title">{servicio.titulo}</h3>
                <p className="service-description">{servicio.descripcion}</p>
                <div className="service-arrow">→</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>¿Listo para comenzar?</h2>
            <p>
              Únete a miles de concesionarios que ya confían en nuestra plataforma para gestionar sus ventas de manera
              eficiente.
            </p>
            <div className="cta-actions">
              <a href="/cliente" className="btn-white">
                <span>🚀</span>
                Comenzar Ahora
              </a>
              <a href="/tiendasBi" className="btn-white">
                <span>📞</span>
                Ver Demo
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Componente principal de la aplicación
function App() {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)

  // Efecto para mostrar loading en cambios de ruta
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        {isLoading && <LoadingSpinner />}

        <div className={`content-wrapper ${isLoading ? "loading" : ""}`}>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* ===== PÁGINA DE INICIO ===== */}
              <Route path="/" element={<HomePage />} />

              {/* ===== MÓDULOS PRINCIPALES ===== */}

              {/* Clientes */}
              <Route path="/cliente" element={<Cliente />} />
              <Route path="/cliente/:id" element={<Cliente />} />
              <Route path="/clientes" element={<ListaClientes />} />

              {/* Vendedores */}
              <Route path="/vendedor" element={<Vendedor />} />
              <Route path="/vendedor/:id" element={<Vendedor />} />
              <Route path="/vendedores" element={<ListaVendedores />} />

              {/* Gerentes */}
              <Route path="/gerentes" element={<Gerentes />} />
              <Route path="/gerentes/:id" element={<Gerentes />} />
              <Route path="/lista-gerentes" element={<ListaGerentes />} />

              {/* ===== UBICACIONES ===== */}

              {/* Regiones */}
              <Route path="/region" element={<Region />} />
              <Route path="/region/:id" element={<Region />} />
              <Route path="/lista-regiones" element={<ListaRegiones />} />

              {/* Ciudades */}
              <Route path="/ciudades" element={<Ciudad />} />
              <Route path="/ciudades/:id" element={<Ciudad />} />
              <Route path="/lista-ciudades" element={<ListaCiudades />} />

              {/* Tiendas */}
              <Route path="/tiendas" element={<Tienda />} />
              <Route path="/lista-tiendas" element={<ListaTiendas />} />

              {/* ===== SEGMENTACIÓN ===== */}

              {/* Segmentos */}
              <Route path="/segmentos" element={<Segmento />} />
              <Route path="/segmentos/:id" element={<Segmento />} />
              <Route path="/lista-segmentos" element={<ListaSegmentos />} />

              {/* ===== RELACIONES ===== */}

              {/* Cliente-Segmento */}
              <Route path="/cliente-segmento" element={<ClienteSegmento />} />
              <Route path="/cliente-segmento/:id" element={<ClienteSegmento />} />
              <Route path="/lista-cliente-segmento" element={<ListaClienteSegmento />} />

              {/* Vendedor-Tienda */}
              <Route path="/vendedor_tienda" element={<VendedorTienda />} />
              <Route path="/vendedor-tienda/:id" element={<VendedorTienda />} />
              <Route path="/lista-vendedor-tienda" element={<ListaVendedorTiendas />} />

              {/* ===== REPORTES Y ANÁLISIS ===== */}
              <Route path="/tiendasBi" element={<Tiendas />} />

              {/* ===== MICROSERVICIO DE VENTAS ===== */}

              {/* Categorías */}
              <Route path="/categoria" element={<Categoria />} />
              <Route path="/categoria/:id" element={<Categoria />} />
              <Route path="/lista-categorias" element={<ListaCategorias />} />

              {/* Fechas */}
              <Route path="/fecha" element={<Fecha />} />
              <Route path="/fecha/:id" element={<Fecha />} />
              <Route path="/lista-fechas" element={<ListaFechas />} />

              {/* Marcas */}
              <Route path="/marca" element={<Marca />} />
              <Route path="/marca/:id" element={<Marca />} />
              <Route path="/lista-marcas" element={<ListaMarcas />} />

              {/* Modelos */}
              <Route path="/modelo" element={<Modelo />} />
              <Route path="/modelo/:id" element={<Modelo />} />
              <Route path="/lista-modelos" element={<ListaModelos />} />

              {/* Productos */}
              <Route path="/producto" element={<Producto />} />
              <Route path="/producto/:id" element={<Producto />} />
              <Route path="/lista-productos" element={<ListaProductos />} />

              {/* Ventas */}
              <Route path="/ventas" element={<Ventas />} />
              <Route path="/ventas/:id" element={<Ventas />} />
              <Route path="/lista-ventas" element={<ListaVentas />} />

              {/* ===== PÁGINAS DE ERROR ===== */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  )
}

export default App
