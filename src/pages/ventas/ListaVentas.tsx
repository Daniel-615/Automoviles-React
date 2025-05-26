"use client"

import type React from "react"
import { useState, useEffect } from "react"
import "../../components/css/ListaVentas.css"

interface VentaItem {
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

interface FechaItem {
  fecha_key: number
  fecha_completa: string
}

interface ProductoItem {
  producto_key: number
  nombre_producto: string
}

interface ApiResponse {
  ventas: VentaItem[]
  total: number
  pagina_actual: number
  total_paginas: number
}

const ListaVentas: React.FC = () => {
  const [ventas, setVentas] = useState<VentaItem[]>([])
  const [fechas, setFechas] = useState<FechaItem[]>([])
  const [productos, setProductos] = useState<ProductoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchVentas(currentPage)
  }, [currentPage])

  const fetchData = async () => {
    try {
      // Fetch fechas
      const fechasResponse = await fetch(
        "https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/get/fecha?per_page=100",
      )

      if (fechasResponse.ok) {
        const fechasData = await fechasResponse.json()
        setFechas(fechasData.fechas || [])
      }

      // Fetch productos
      const productosResponse = await fetch(
        "https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/get/producto?per_page=100",
      )

      if (productosResponse.ok) {
        const productosData = await productosResponse.json()
        setProductos(productosData.productos || [])
      }
    } catch (error) {
      console.error("Error al cargar datos:", error)
    }
  }

  const fetchVentas = async (page = 1) => {
    try {
      setLoading(true)
      const response = await fetch(
        `https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/get/venta?page=${page}&per_page=10`,
      )

      if (!response.ok) {
        throw new Error("Error al cargar las ventas")
      }

      const data: ApiResponse = await response.json()
      setVentas(data.ventas)
      setCurrentPage(data.pagina_actual)
      setTotalPages(data.total_paginas)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const getFechaNombre = (fechaKey: number): string => {
    const fecha = fechas.find((f) => f.fecha_key === fechaKey)
    return fecha ? fecha.fecha_completa : "Fecha no encontrada"
  }

  const getProductoNombre = (productoKey: number): string => {
    const producto = productos.find((p) => p.producto_key === productoKey)
    return producto ? producto.nombre_producto : "Producto no encontrado"
  }

  const calculateTotal = (venta: VentaItem): number => {
    return venta.cantidad_vendida * venta.precio_unitario - venta.descuento_aplicado
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta venta?")) {
      return
    }

    try {
      const response = await fetch(
        `https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/delete/venta/${id}`,
        {
          method: "DELETE",
        },
      )

      if (response.ok) {
        await fetchVentas(currentPage)
      } else {
        throw new Error("Error al eliminar la venta")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar")
    }
  }

  const filteredVentas = ventas.filter(
    (venta) =>
      getProductoNombre(venta.producto_key).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getFechaNombre(venta.fecha_key).includes(searchTerm) ||
      venta.cliente_key.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando ventas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <span className="error-icon">❌</span>
        <p>{error}</p>
        <button onClick={() => fetchVentas(currentPage)} className="retry-btn">
          🔄 Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="lista-ventas-container">
      <div className="lista-header">
        <h1>💰 Lista de Ventas</h1>
        <div className="header-actions">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar ventas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="ventas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Descuento</th>
              <th>Total</th>
              <th>Cliente</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredVentas.map((venta) => (
              <tr key={venta.venta_key}>
                <td>{venta.venta_key}</td>
                <td>
                  <span className="fecha-badge">📅 {getFechaNombre(venta.fecha_key)}</span>
                </td>
                <td>
                  <span className="producto-name">🚙 {getProductoNombre(venta.producto_key)}</span>
                </td>
                <td>
                  <span className="cantidad-badge">📊 {venta.cantidad_vendida}</span>
                </td>
                <td>
                  <span className="precio-badge">💰 ${venta.precio_unitario?.toLocaleString()}</span>
                </td>
                <td>
                  <span className="descuento-badge">🏷️ ${venta.descuento_aplicado?.toLocaleString()}</span>
                </td>
                <td>
                  <span className="total-badge">💵 ${calculateTotal(venta).toLocaleString()}</span>
                </td>
                <td>
                  <span className="uuid-badge" title={venta.cliente_key}>
                    👤 {venta.cliente_key.substring(0, 8)}...
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => handleDelete(venta.venta_key)} className="delete-btn">
                      🗑️ Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          ⬅️ Anterior
        </button>
        <span className="pagination-info">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          Siguiente ➡️
        </button>
      </div>
    </div>
  )
}

export default ListaVentas
