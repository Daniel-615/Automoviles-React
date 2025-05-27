"use client"

import type React from "react"
import { useState, useEffect } from "react"
import "../../components/css/ventas.css"

interface VentasData {
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

interface ClienteItem {
  cliente_key: string
  nombre: string
  apellido: string
  email: string
  telefono: string
}

interface TiendaItem {
  tienda_key: string
  nombre_tienda: string
  direccion: string
  ciudad: string
}

interface VendedorItem {
  vendedor_key: string
  nombre: string
  edad: number
  salario: number
  activo: boolean
}

const Ventas: React.FC = () => {
  const [formData, setFormData] = useState<VentasData>({
    fecha_key: 0,
    producto_key: 0,
    cantidad_vendida: 1,
    precio_unitario: 0,
    descuento_aplicado: 0,
    margen_ganancia: 0,
    cliente_key: "",
    tienda_key: "",
    vendedor_key: "",
  })

  const [fechas, setFechas] = useState<FechaItem[]>([])
  const [productos, setProductos] = useState<ProductoItem[]>([])
  const [clientes, setClientes] = useState<ClienteItem[]>([])
  const [tiendas, setTiendas] = useState<TiendaItem[]>([])
  const [vendedores, setVendedores] = useState<VendedorItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoadingData(true)

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

      // Fetch clientes
      const clientesResponse = await fetch(
        "https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas/get/cliente?per_page=100",
      )

      if (clientesResponse.ok) {
        const clientesData = await clientesResponse.json()
        setClientes(clientesData.clientes || [])
      }

      // Fetch tiendas
      const tiendasResponse = await fetch(
        "https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas/get/tienda",
      )

      if (tiendasResponse.ok) {
        const tiendasData = await tiendasResponse.json()
        setTiendas(tiendasData.tiendas || [])
      }

      // Fetch vendedores
      const vendedoresResponse = await fetch(
        "https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas/get/vendedor",
      )

      if (vendedoresResponse.ok) {
        const vendedoresData = await vendedoresResponse.json()
        setVendedores(vendedoresData.vendedores || [])
      }
    } catch (error) {
      console.error("Error al cargar datos:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const calculateTotal = () => {
    return formData.cantidad_vendida * formData.precio_unitario - formData.descuento_aplicado
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (formData.fecha_key === 0 || formData.producto_key === 0) {
      setMessage({ text: "Por favor selecciona una fecha y un producto", type: "error" })
      setLoading(false)
      return
    }

    if (!formData.cliente_key || !formData.tienda_key || !formData.vendedor_key) {
      setMessage({ text: "Por favor selecciona cliente, tienda y vendedor", type: "error" })
      setLoading(false)
      return
    }

    try {
      const response = await fetch(
        "https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/post/venta",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      )

      const data = await response.json()

      if (response.ok) {
        setMessage({ text: "Venta registrada exitosamente", type: "success" })
        setFormData({
          fecha_key: 0,
          producto_key: 0,
          cantidad_vendida: 1,
          precio_unitario: 0,
          descuento_aplicado: 0,
          margen_ganancia: 0,
          cliente_key: "",
          tienda_key: "",
          vendedor_key: "",
        })
      } else {
        setMessage({ text: data.message || "Error al registrar la venta", type: "error" })
      }
    } catch (error) {
      setMessage({ text: "Error de conexión", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ventas-container">
      <div className="ventas-header">
        <h1 className="ventas-title">🚗 Registro de Ventas</h1>
        <p className="ventas-subtitle">Administra las transacciones de venta del sistema</p>
      </div>

      <div className="ventas-card">
        <form onSubmit={handleSubmit} className="ventas-form">
          {/* Sección Principal */}
          <div className="form-section">
            <h3 className="section-title">📋 Información Principal</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fecha_key">📅 Fecha *</label>
                {loadingData ? (
                  <div className="loading-select">
                    <div className="spinner"></div>
                    Cargando fechas...
                  </div>
                ) : (
                  <select
                    id="fecha_key"
                    name="fecha_key"
                    value={formData.fecha_key}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={0}>Selecciona una fecha</option>
                    {fechas.map((fecha) => (
                      <option key={fecha.fecha_key} value={fecha.fecha_key}>
                        {fecha.fecha_completa}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="producto_key">🚙 Producto *</label>
                {loadingData ? (
                  <div className="loading-select">
                    <div className="spinner"></div>
                    Cargando productos...
                  </div>
                ) : (
                  <select
                    id="producto_key"
                    name="producto_key"
                    value={formData.producto_key}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={0}>Selecciona un producto</option>
                    {productos.map((producto) => (
                      <option key={producto.producto_key} value={producto.producto_key}>
                        {producto.nombre_producto}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Sección Detalles */}
          <div className="form-section">
            <h3 className="section-title">💰 Detalles de Venta</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cantidad_vendida">📊 Cantidad Vendida *</label>
                <input
                  type="number"
                  id="cantidad_vendida"
                  name="cantidad_vendida"
                  value={formData.cantidad_vendida}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="precio_unitario">💵 Precio Unitario *</label>
                <input
                  type="number"
                  id="precio_unitario"
                  name="precio_unitario"
                  value={formData.precio_unitario}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="descuento_aplicado">🏷️ Descuento Aplicado</label>
                <input
                  type="number"
                  id="descuento_aplicado"
                  name="descuento_aplicado"
                  value={formData.descuento_aplicado}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="margen_ganancia">📈 Margen de Ganancia *</label>
                <input
                  type="number"
                  id="margen_ganancia"
                  name="margen_ganancia"
                  value={formData.margen_ganancia}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Sección Participantes */}
          <div className="form-section">
            <h3 className="section-title">👥 Información de Participantes</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cliente_key">👤 Cliente *</label>
                {loadingData ? (
                  <div className="loading-select">
                    <div className="spinner"></div>
                    Cargando clientes...
                  </div>
                ) : (
                  <select
                    id="cliente_key"
                    name="cliente_key"
                    value={formData.cliente_key}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona un cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.cliente_key} value={cliente.cliente_key}>
                        {cliente.nombre} {cliente.apellido}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="tienda_key">🏪 Tienda *</label>
                {loadingData ? (
                  <div className="loading-select">
                    <div className="spinner"></div>
                    Cargando tiendas...
                  </div>
                ) : (
                  <select
                    id="tienda_key"
                    name="tienda_key"
                    value={formData.tienda_key}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona una tienda</option>
                    {tiendas.map((tienda) => (
                      <option key={tienda.tienda_key} value={tienda.tienda_key}>
                        {tienda.nombre_tienda} - {tienda.direccion}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="vendedor_key">👨‍💼 Vendedor *</label>
                {loadingData ? (
                  <div className="loading-select">
                    <div className="spinner"></div>
                    Cargando vendedores...
                  </div>
                ) : (
                  <select
                    id="vendedor_key"
                    name="vendedor_key"
                    value={formData.vendedor_key}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona un vendedor</option>
                    {vendedores.map((vendedor) => (
                      <option key={vendedor.vendedor_key} value={vendedor.vendedor_key}>
                        {vendedor.nombre} - {vendedor.activo ? "Activo" : "Inactivo"}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="total-section">
            <div className="total-display">
              <span className="total-label">💰 Total de la Venta:</span>
              <span className="total-amount">
                ${calculateTotal().toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Mensajes */}
          {message && (
            <div className={`message ${message.type}`}>
              <span className="message-icon">{message.type === "success" ? "✅" : "❌"}</span>
              {message.text}
            </div>
          )}

          {/* Botón Submit */}
          <div className="form-actions">
            <button type="submit" disabled={loading || loadingData} className="submit-btn">
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Registrando...
                </>
              ) : (
                <>💾 Registrar Venta</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Ventas
