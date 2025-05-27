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
import Carousel from "react-multi-carousel"
import "react-multi-carousel/lib/styles.css"
import "./App.css"

// Datos de la aplicación
const vehiculos = [
  { src: "/images/car1.jpg", title: "SUV Premium", description: "Tecnología avanzada y confort" },
  { src: "/images/car2.jpg", title: "Sedán Ejecutivo", description: "Elegancia y rendimiento" },
  { src: "/images/car3.jpg", title: "Hatchback Urbano", description: "Perfecto para la ciudad" },
  { src: "/images/car4.jpg", title: "Crossover Familiar", description: "Espacio y versatilidad" },
]

const estadisticas = [
  { titulo: "Clientes Activos", valor: "1,234", icono: "👥", color: "#1565c0" },
  { titulo: "Tiendas", valor: "45", icono: "🏪", color: "#2e7d32" },
  { titulo: "Vendedores", valor: "156", icono: "👨‍💼", color: "#f57c00" },
  { titulo: "Ventas del Mes", valor: "Q 2.5M", icono: "💰", color: "#7b1fa2" },
]

const accesosRapidos = [
  { titulo: "Gestionar Clientes", ruta: "/cliente", icono: "👤", descripcion: "Crear y editar clientes" },
  { titulo: "Administrar Tiendas", ruta: "/tiendas", icono: "🏢", descripcion: "Gestión de tiendas" },
  { titulo: "Ver Reportes", ruta: "/tiendasBi", icono: "📊", descripcion: "Análisis y estadísticas" },
  { titulo: "Vendedor-Tienda", ruta: "/vendedor_tienda", icono: "🤝", descripcion: "Asignar vendedores" },
  { titulo: "Gestionar Productos", ruta: "/lista-productos", icono: "🚗", descripcion: "Catálogo de vehículos" },
  { titulo: "Registrar Ventas", ruta: "/ventas", icono: "💰", descripcion: "Nueva transacción" },
  { titulo: "Ver Ventas", ruta: "/lista-ventas", icono: "📋", descripcion: "Historial de ventas" },
  { titulo: "Marcas y Modelos", ruta: "/lista-marcas", icono: "🏭", descripcion: "Gestión de marcas" },
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

// Componente de la página de inicio mejorada
const HomePage = () => {
  const [fechaHora, setFechaHora] = useState({
    fecha: "",
    hora: "",
    dia: "",
    mes: "",
    año: "",
    ampm: "",
  })

  useEffect(() => {
    const actualizarFechaHora = () => {
      const ahora = new Date()

      const opciones: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }

      const fecha = ahora.toLocaleDateString("es-ES", opciones)
      const hora = ahora.toLocaleTimeString("es-ES", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })

      const dia = ahora.getDate().toString().padStart(2, "0")
      const mes = ahora.toLocaleDateString("es-ES", { month: "short" })
      const año = ahora.getFullYear().toString()

      // Para formato 12 horas si se prefiere
      // @ts-ignore
      const hora12 = ahora.toLocaleTimeString("es-ES", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      })
      const ampm = ahora.getHours() >= 12 ? "PM" : "AM"

      setFechaHora({
        fecha,
        hora,
        dia,
        mes: mes.charAt(0).toUpperCase() + mes.slice(1),
        año,
        ampm,
      })
    }

    // Actualizar inmediatamente
    actualizarFechaHora()

    // Actualizar cada segundo
    const intervalo = setInterval(actualizarFechaHora, 1000)

    return () => clearInterval(intervalo)
  }, [])

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Bienvenido a <span className="brand-highlight">VentasApp</span>
            </h1>
            <p className="hero-subtitle">Sistema integral de gestión de ventas de vehículos</p>

            {/* Reloj profesional mejorado */}
            <div className="reloj-profesional">
              <div className="reloj-container">
                <div className="fecha-digital">
                  <div className="dia-numero">{fechaHora.dia}</div>
                  <div className="mes-año">
                    <span className="mes">{fechaHora.mes}</span>
                    <span className="año">{fechaHora.año}</span>
                  </div>
                </div>
                <div className="separador-reloj"></div>
                <div className="hora-digital">
                  <div className="hora-principal">{fechaHora.hora}</div>
                  <div className="zona-horaria">
                    <span className="icono-reloj">🕐</span>
                    <span>Guatemala</span>
                  </div>
                </div>
              </div>
              <div className="fecha-completa">
                <span className="icono-calendario">📅</span>
                <span>{fechaHora.fecha}</span>
              </div>
            </div>
          </div>

          <div className="carousel-section">
            <Carousel
              additionalTransfrom={0}
              arrows
              autoPlay
              autoPlaySpeed={5000}
              centerMode={false}
              className="carousel-container"
              containerClass="carousel-wrapper"
              draggable
              infinite
              itemClass="carousel-item-padding"
              keyBoardControl
              minimumTouchDrag={80}
              responsive={{
                desktop: { breakpoint: { max: 3000, min: 1024 }, items: 2 },
                tablet: { breakpoint: { max: 1024, min: 768 }, items: 1 },
                mobile: { breakpoint: { max: 768, min: 0 }, items: 1 },
              }}
              showDots={true}
              swipeable
            >
              {vehiculos.map((vehiculo, index) => (
                <div key={index} className="carousel-item">
                  <div className="vehicle-card">
                    <img src={vehiculo.src || "/placeholder.svg"} alt={vehiculo.title} className="carousel-image" />
                    <div className="vehicle-overlay">
                      <h3>{vehiculo.title}</h3>
                      <p>{vehiculo.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="stats-section">
        <div className="container">
          <h2 className="section-title">Resumen del Sistema</h2>
          <div className="stats-grid">
            {estadisticas.map((stat, index) => (
              <div key={index} className="stat-card" style={{ borderTopColor: stat.color }}>
                <div className="stat-icon" style={{ backgroundColor: `${stat.color}20` }}>
                  {stat.icono}
                </div>
                <div className="stat-info">
                  <h3 className="stat-value" style={{ color: stat.color }}>
                    {stat.valor}
                  </h3>
                  <p className="stat-title">{stat.titulo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accesos Rápidos */}
      <section className="quick-access-section">
        <div className="container">
          <h2 className="section-title">Accesos Rápidos</h2>
          <div className="access-grid">
            {accesosRapidos.map((acceso, index) => (
              <a key={index} href={acceso.ruta} className="access-card">
                <div className="access-icon">{acceso.icono}</div>
                <h3 className="access-title">{acceso.titulo}</h3>
                <p className="access-description">{acceso.descripcion}</p>
                <div className="access-arrow">→</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Información adicional */}
      <section className="info-section">
        <div className="container">
          <div className="info-content">
            <h2>Gestiona tu negocio de manera eficiente</h2>
            <p>
              Controla clientes, vendedores, tiendas, regiones y más desde una plataforma centralizada. Obtén reportes
              detallados y toma decisiones basadas en datos reales.
            </p>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <span>Gestión completa de clientes y vendedores</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <span>Control de tiendas y ubicaciones</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <span>Reportes y análisis en tiempo real</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <span>Segmentación avanzada de clientes</span>
              </div>
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
