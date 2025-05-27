"use client"

import type React from "react"
import { Suspense, useState, useEffect } from "react"
import { Routes, Route, useLocation, useNavigate } from "react-router-dom"
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

// URLs de los microservicios
const MICROSERVICIO_CLIENTES_URL =
  "https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas"
const MICROSERVICIO_VENTAS_URL = "https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas"

// Interfaces para los datos
interface EstadisticasData {
  clientesActivos: number
  tiendas: number
  vendedores: number
  ventasDelMes: number
  montoVentasDelMes: number
}

interface MarcaData {
  marca_key: number
  nombre_marca: string
  pais_origen: string
}

interface ModeloData {
  modelo_key: number
  nombre_modelo: string
  marca_key: number
}

interface CategoriaData {
  categoria_key: number
  nombre_categoria: string
}

interface ProductoData {
  producto_key: number
  nombre_producto: string
  modelo_key: number
  categoria_key: number
  ano_fabricacion: number
  color: string
  precio_lista: number
}

interface ClienteData {
  cliente_key: string
  nombre: string
  email: string
  telefono: string
}

interface VendedorData {
  vendedor_key: string
  nombre: string
  email: string
  telefono: string
}

interface TiendaData {
  tienda_key: string
  nombre_tienda: string
  direccion: string
  ciudad_key: string
}

interface VentaData {
  venta_key: number
  fecha_key: number
  producto_key: number
  cantidad_vendida: number
  precio_unitario: number
  descuento_aplicado: number
  margen_ganancia: number
  cliente_key: string
  tienda_key: string
  vendedor_key: string
}

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

// Componente de búsqueda de productos con datos reales
const ProductSearchSection = () => {
  const [marcas, setMarcas] = useState<MarcaData[]>([])
  const [modelos, setModelos] = useState<ModeloData[]>([])
  const [categorias, setCategorias] = useState<CategoriaData[]>([])
  const [productos, setProductos] = useState<ProductoData[]>([])
  const [filteredModelos, setFilteredModelos] = useState<ModeloData[]>([])
  const [searchResults, setSearchResults] = useState<ProductoData[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  const [searchForm, setSearchForm] = useState({
    marca_key: "",
    modelo_key: "",
    categoria_key: "",
    ano_fabricacion: "",
  })

  const navigate = useNavigate()

  // Cargar datos reales de los microservicios
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true)

        // Fetch marcas
        const marcasResponse = await fetch(`${MICROSERVICIO_VENTAS_URL}/get/marca?per_page=100`)
        if (marcasResponse.ok) {
          const marcasData = await marcasResponse.json()
          setMarcas(marcasData.marcas || [])
        }

        // Fetch modelos
        const modelosResponse = await fetch(`${MICROSERVICIO_VENTAS_URL}/get/modelo?per_page=100`)
        if (modelosResponse.ok) {
          const modelosData = await modelosResponse.json()
          setModelos(modelosData.modelos || [])
        }

        // Fetch categorias
        const categoriasResponse = await fetch(`${MICROSERVICIO_VENTAS_URL}/get/categorias?per_page=100`)
        if (categoriasResponse.ok) {
          const categoriasData = await categoriasResponse.json()
          setCategorias(categoriasData.categorias || [])
        }

        // Fetch productos
        const productosResponse = await fetch(`${MICROSERVICIO_VENTAS_URL}/get/producto?per_page=100`)
        if (productosResponse.ok) {
          const productosData = await productosResponse.json()
          setProductos(productosData.productos || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filtrar modelos cuando cambia la marca
  useEffect(() => {
    if (searchForm.marca_key) {
      const filtered = modelos.filter((modelo) => modelo.marca_key === Number.parseInt(searchForm.marca_key))
      setFilteredModelos(filtered)
    } else {
      setFilteredModelos([])
    }
    setSearchForm((prev) => ({ ...prev, modelo_key: "" }))
  }, [searchForm.marca_key, modelos])

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setSearchForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let filtered = productos

      if (searchForm.marca_key) {
        const modelosDeMarcar = modelos.filter((m) => m.marca_key === Number.parseInt(searchForm.marca_key))
        const modeloKeys = modelosDeMarcar.map((m) => m.modelo_key)
        filtered = filtered.filter((p) => modeloKeys.includes(p.modelo_key))
      }

      if (searchForm.modelo_key) {
        filtered = filtered.filter((p) => p.modelo_key === Number.parseInt(searchForm.modelo_key))
      }

      if (searchForm.categoria_key) {
        filtered = filtered.filter((p) => p.categoria_key === Number.parseInt(searchForm.categoria_key))
      }

      if (searchForm.ano_fabricacion) {
        filtered = filtered.filter((p) => p.ano_fabricacion === Number.parseInt(searchForm.ano_fabricacion))
      }

      setSearchResults(filtered)
    } catch (error) {
      console.error("Error searching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const getYears = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let year = currentYear; year >= currentYear - 20; year--) {
      years.push(year.toString())
    }
    return years
  }


  if (dataLoading) {
    return (
      <div className="search-bar">
        <div className="loading-message">
          <LoadingSpinner />
          <p>Cargando datos de productos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="product-search-section">
      <div className="search-bar">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="form-group">
            <label htmlFor="marca_key">Car Make</label>
            <select id="marca_key" name="marca_key" value={searchForm.marca_key} onChange={handleInputChange}>
              <option value="">Select Make</option>
              {marcas.map((marca) => (
                <option key={marca.marca_key} value={marca.marca_key}>
                  {marca.nombre_marca}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="modelo_key">Select A Model First</label>
            <select
              id="modelo_key"
              name="modelo_key"
              value={searchForm.modelo_key}
              onChange={handleInputChange}
              disabled={!searchForm.marca_key}
            >
              <option value="">Select Model</option>
              {filteredModelos.map((modelo) => (
                <option key={modelo.modelo_key} value={modelo.modelo_key}>
                  {modelo.nombre_modelo}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="categoria_key">Car Type</label>
            <select
              id="categoria_key"
              name="categoria_key"
              value={searchForm.categoria_key}
              onChange={handleInputChange}
            >
              <option value="">Select Type</option>
              {categorias.map((categoria) => (
                <option key={categoria.categoria_key} value={categoria.categoria_key}>
                  {categoria.nombre_categoria}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="ano_fabricacion">Select Year</label>
            <select
              id="ano_fabricacion"
              name="ano_fabricacion"
              value={searchForm.ano_fabricacion}
              onChange={handleInputChange}
            >
              <option value="">Select Year</option>
              {getYears().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? "⏳" : "🔍"} Search
          </button>
        </form>
      </div>

      {/* Resultados de búsqueda */}
      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Resultados de búsqueda ({searchResults.length} productos encontrados)</h3>
          <div className="results-grid">
            {searchResults.slice(0, 6).map((producto) => {
              const modelo = modelos.find((m) => m.modelo_key === producto.modelo_key)
              const marca = marcas.find((m) => m.marca_key === modelo?.marca_key)
              const categoria = categorias.find((c) => c.categoria_key === producto.categoria_key)

              return (
                <div key={producto.producto_key} className="result-card">
                  <div className="result-header">
                    <h4>{producto.nombre_producto}</h4>
                    <span className="result-price">Q{producto.precio_lista.toLocaleString()}</span>
                  </div>
                  <div className="result-details">
                    <p>
                      <strong>Marca:</strong> {marca?.nombre_marca || "N/A"}
                    </p>
                    <p>
                      <strong>Modelo:</strong> {modelo?.nombre_modelo || "N/A"}
                    </p>
                    <p>
                      <strong>Categoría:</strong> {categoria?.nombre_categoria || "N/A"}
                    </p>
                    <p>
                      <strong>Año:</strong> {producto.ano_fabricacion}
                    </p>
                    <p>
                      <strong>Color:</strong> {producto.color}
                    </p>
                  </div>
                  <button className="result-btn" onClick={() => navigate("/lista-productos")}>
                    Ver detalles
                  </button>
                </div>
              )
            })}
          </div>
          {searchResults.length > 6 && (
            <div className="view-all">
              <button className="btn-view-all" onClick={() => navigate("/lista-productos")}>
                Ver todos los resultados ({searchResults.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Componente de búsqueda de datos de ventas con datos reales
const SalesSearchSection = () => {
  const [clientes, setClientes] = useState<ClienteData[]>([])
  const [vendedores, setVendedores] = useState<VendedorData[]>([])
  const [tiendas, setTiendas] = useState<TiendaData[]>([])
  const [_ventas, setVentas] = useState<VentaData[]>([])
  const [searchResults, _setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [_searchType, _setSearchType] = useState("ventas")

  const [salesSearchForm, setSalesSearchForm] = useState({
    cliente_key: "",
    vendedor_key: "",
    tienda_key: "",
    fecha_inicio: "",
    fecha_fin: "",
  })

  const navigate = useNavigate()

  // Cargar datos reales de los microservicios
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setDataLoading(true)

        // Fetch clientes
        const clientesResponse = await fetch(`${MICROSERVICIO_CLIENTES_URL}/get/cliente?per_page=100`)
        if (clientesResponse.ok) {
          const clientesData = await clientesResponse.json()
          setClientes(clientesData.clientes || [])
        }

        // Fetch vendedores
        const vendedoresResponse = await fetch(`${MICROSERVICIO_CLIENTES_URL}/get/vendedor?per_page=100`)
        if (vendedoresResponse.ok) {
          const vendedoresData = await vendedoresResponse.json()
          setVendedores(vendedoresData.vendedores || [])
        }

        // Fetch tiendas
        const tiendasResponse = await fetch(`${MICROSERVICIO_CLIENTES_URL}/get/tienda?per_page=100`)
        if (tiendasResponse.ok) {
          const tiendasData = await tiendasResponse.json()
          setTiendas(tiendasData.tiendas || [])
        }

        // Fetch ventas
        const ventasResponse = await fetch(`${MICROSERVICIO_VENTAS_URL}/get/venta?per_page=100`)
        if (ventasResponse.ok) {
          const ventasData = await ventasResponse.json()
          setVentas(ventasData.ventas || [])
        }
      } catch (error) {
        console.error("Error fetching sales data:", error)
      } finally {
        setDataLoading(false)
      }
    }

    fetchSalesData()
  }, [])

  const handleSalesInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setSalesSearchForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSalesSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Construir parámetros de búsqueda para la URL
      const searchParams = new URLSearchParams()

      if (salesSearchForm.cliente_key) {
        searchParams.append("cliente", salesSearchForm.cliente_key)
      }
      if (salesSearchForm.vendedor_key) {
        searchParams.append("vendedor", salesSearchForm.vendedor_key)
      }
      if (salesSearchForm.tienda_key) {
        searchParams.append("tienda", salesSearchForm.tienda_key)
      }

      // Navegar a la página de ventas con los filtros aplicados
      const queryString = searchParams.toString()
      if (queryString) {
        navigate(`/lista-ventas?${queryString}`)
      } else {
        navigate("/lista-ventas")
      }
    } catch (error) {
      console.error("Error navigating to sales:", error)
    } finally {
      setLoading(false)
    }
  }

  if (dataLoading) {
    return (
      <div className="sales-search-section">
        <div className="loading-message">
          <LoadingSpinner />
          <p>Cargando datos de ventas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="sales-search-section">
      <div className="search-header">
        <h3>🔍 Búsqueda de Datos de Ventas</h3>
        <p>Consulta información de ventas, clientes, vendedores y tiendas</p>
      </div>

      <div className="sales-search-bar">
        <form className="sales-search-form" onSubmit={handleSalesSearch}>
          <div className="form-group">
            <label htmlFor="cliente_key">Cliente</label>
            <select
              id="cliente_key"
              name="cliente_key"
              value={salesSearchForm.cliente_key}
              onChange={handleSalesInputChange}
            >
              <option value="">Todos los clientes</option>
              {clientes.map((cliente) => (
                <option key={cliente.cliente_key} value={cliente.cliente_key}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="vendedor_key">Vendedor</label>
            <select
              id="vendedor_key"
              name="vendedor_key"
              value={salesSearchForm.vendedor_key}
              onChange={handleSalesInputChange}
            >
              <option value="">Todos los vendedores</option>
              {vendedores.map((vendedor) => (
                <option key={vendedor.vendedor_key} value={vendedor.vendedor_key}>
                  {vendedor.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tienda_key">Tienda</label>
            <select
              id="tienda_key"
              name="tienda_key"
              value={salesSearchForm.tienda_key}
              onChange={handleSalesInputChange}
            >
              <option value="">Todas las tiendas</option>
              {tiendas.map((tienda) => (
                <option key={tienda.tienda_key} value={tienda.tienda_key}>
                  {tienda.nombre_tienda}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? "⏳" : "🔍"} Buscar en Ventas
          </button>
        </form>

        {/* Botones de acceso rápido */}
        <div className="quick-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate("/tiendasBi")}>
            📊 Ver Reportes BI
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate("/lista-tiendas")}>
            🏪 Gestionar Tiendas
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate("/lista-vendedores")}>
            👨‍💼 Ver Vendedores
          </button>
        </div>
      </div>

      {/* Resultados de búsqueda de ventas */}
      {searchResults.length > 0 && (
        <div className="sales-results">
          <h4>Resultados encontrados ({searchResults.length})</h4>
          <div className="results-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Vendedor</th>
                  <th>Tienda</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.slice(0, 10).map((venta) => (
                  <tr key={venta.venta_key}>
                    <td>{venta.venta_key}</td>
                    <td>{venta.cliente?.nombre_cliente || "N/A"}</td>
                    <td>{venta.vendedor?.nombre_vendedor || "N/A"}</td>
                    <td>{venta.tienda?.nombre_tienda || "N/A"}</td>
                    <td>{venta.cantidad_vendida}</td>
                    <td>Q{venta.precio_unitario?.toLocaleString() || "N/A"}</td>
                    <td>
                      <button className="btn-small" onClick={() => navigate("/lista-ventas")}>
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {searchResults.length > 10 && (
            <div className="view-all">
              <button className="btn-view-all" onClick={() => navigate("/lista-ventas")}>
                Ver todos los resultados ({searchResults.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Componente de estadísticas con datos reales
const EstadisticasSection = () => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasData>({
    clientesActivos: 0,
    tiendas: 0,
    vendedores: 0,
    ventasDelMes: 0,
    montoVentasDelMes: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        setLoading(true)

        // Fetch clientes count
        const clientesResponse = await fetch(`${MICROSERVICIO_CLIENTES_URL}/get/cliente?per_page=1`)
        let clientesCount = 0
        if (clientesResponse.ok) {
          const clientesData = await clientesResponse.json()
          clientesCount = clientesData.total || 0
        }

        // Fetch tiendas count
        const tiendasResponse = await fetch(`${MICROSERVICIO_CLIENTES_URL}/get/tienda?per_page=1`)
        let tiendasCount = 0
        if (tiendasResponse.ok) {
          const tiendasData = await tiendasResponse.json()
          tiendasCount = tiendasData.total || 0
        }

        // Fetch vendedores count
        const vendedoresResponse = await fetch(`${MICROSERVICIO_CLIENTES_URL}/get/vendedor?per_page=1`)
        let vendedoresCount = 0
        if (vendedoresResponse.ok) {
          const vendedoresData = await vendedoresResponse.json()
          vendedoresCount = vendedoresData.total || 0
        }

        // Fetch ventas count
        const ventasResponse = await fetch(`${MICROSERVICIO_VENTAS_URL}/get/venta?per_page=1`)
        let ventasCount = 0
        let montoTotal = 0
        if (ventasResponse.ok) {
          const ventasData = await ventasResponse.json()
          ventasCount = ventasData.total || 0

          // Fetch todas las ventas para calcular el monto total
          const todasVentasResponse = await fetch(`${MICROSERVICIO_VENTAS_URL}/get/venta?per_page=100`)
          if (todasVentasResponse.ok) {
            const todasVentasData = await todasVentasResponse.json()
            const ventas = todasVentasData.ventas || []
            montoTotal = ventas.reduce((total: number, venta: VentaData) => {
              return total + (venta.precio_unitario * venta.cantidad_vendida - venta.descuento_aplicado)
            }, 0)
          }
        }

        setEstadisticas({
          clientesActivos: clientesCount,
          tiendas: tiendasCount,
          vendedores: vendedoresCount,
          ventasDelMes: ventasCount,
          montoVentasDelMes: montoTotal,
        })
      } catch (error) {
        console.error("Error fetching statistics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEstadisticas()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <section className="stats-section">
        <div className="container">
          <h2 className="section-title">Nuestros Números</h2>
          <p className="section-subtitle">Cargando estadísticas en tiempo real...</p>
          <div className="stats-grid">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="stat-card loading">
                <LoadingSpinner />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const statsData = [
    {
      titulo: "Clientes Activos",
      valor: estadisticas.clientesActivos.toLocaleString(),
      icono: "👥",
      color: "#dc2626",
    },
    {
      titulo: "Tiendas",
      valor: estadisticas.tiendas.toString(),
      icono: "🏪",
      color: "#dc2626",
    },
    {
      titulo: "Vendedores",
      valor: estadisticas.vendedores.toString(),
      icono: "👨‍💼",
      color: "#dc2626",
    },
    {
      titulo: "Ventas Totales",
      valor: formatCurrency(estadisticas.montoVentasDelMes),
      icono: "💰",
      color: "#dc2626",
    },
  ]

  return (
    <section className="stats-section">
      <div className="container">
        <h2 className="section-title">Nuestros Números</h2>
        <p className="section-subtitle">Cifras en tiempo real de nuestro sistema</p>
        <div className="stats-grid">
          {statsData.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icono}</div>
              <h3 className="stat-value">{stat.valor}</h3>
              <p className="stat-title">{stat.titulo}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Componente de la página de inicio
const HomePage = () => {
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

          {/* Búsqueda de Productos con datos reales */}
          <ProductSearchSection />
        </div>
      </section>

      {/* Sección de Búsqueda de Ventas con datos reales */}
      <section className="sales-search-section-wrapper">
        <div className="container">
          <SalesSearchSection />
        </div>
      </section>

      {/* Estadísticas con datos reales */}
      <EstadisticasSection />

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
