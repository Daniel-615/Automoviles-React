"use client"

import type React from "react"
import { useState, useEffect } from "react"
import '../../components/css/ventas.css'

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
      setMessage({ text: "Por favor completa todos los campos de UUID", type: "error" })
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
        <h1>💰 Registro de Ventas</h1>
        <p>Administra las transacciones de venta del sistema</p>
      </div>

      <div className="ventas-form-container">
        <form onSubmit={handleSubmit} className="ventas-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fecha_key">
                <span className="label-icon">📅</span>
                Fecha *
              </label>
              {loadingData ? (
                <div className="loading-select">
                  <span className="loading-spinner"></span>
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
              <label htmlFor="producto_key">
                <span className="label-icon">🚙</span>
                Producto *
              </label>
              {loadingData ? (
                <div className="loading-select">
                  <span className="loading-spinner"></span>
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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cantidad_vendida">
                <span className="label-icon">📊</span>
                Cantidad Vendida *
              </label>
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
              <label htmlFor="precio_unitario">
                <span className="label-icon">💰</span>
                Precio Unitario *
              </label>
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
              <label htmlFor="descuento_aplicado">
                <span className="label-icon">🏷️</span>
                Descuento Aplicado
              </label>
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
              <label htmlFor="margen_ganancia">
                <span className="label-icon">📈</span>
                Margen de Ganancia *
              </label>
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

          <div className="form-group">
            <label htmlFor="cliente_key">
              <span className="label-icon">👤</span>
              Cliente UUID *
            </label>
            <input
              type="text"
              id="cliente_key"
              name="cliente_key"
              value={formData.cliente_key}
              onChange={handleInputChange}
              required
              placeholder="UUID del cliente"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tienda_key">
                <span className="label-icon">🏪</span>
                Tienda UUID *
              </label>
              <input
                type="text"
                id="tienda_key"
                name="tienda_key"
                value={formData.tienda_key}
                onChange={handleInputChange}
                required
                placeholder="UUID de la tienda"
              />
            </div>

            <div className="form-group">
              <label htmlFor="vendedor_key">
                <span className="label-icon">👨‍💼</span>
                Vendedor UUID *
              </label>
              <input
                type="text"
                id="vendedor_key"
                name="vendedor_key"
                value={formData.vendedor_key}
                onChange={handleInputChange}
                required
                placeholder="UUID del vendedor"
              />
            </div>
          </div>

          <div className="total-section">
            <div className="total-display">
              <span className="total-label">💵 Total de la Venta:</span>
              <span className="total-amount">${calculateTotal().toLocaleString()}</span>
            </div>
          </div>

          {message && (
            <div className={`message ${message.type}`}>
              <span className="message-icon">{message.type === "success" ? "✅" : "❌"}</span>
              {message.text}
            </div>
          )}

          <button type="submit" disabled={loading || loadingData} className="submit-btn">
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Registrando...
              </>
            ) : (
              <>
                <span className="btn-icon">💾</span>
                Registrar Venta
              </>
            )}
          </button>
        </form>

        <div className="ventas-info">
          <h3>💡 Información sobre Ventas</h3>
          <ul>
            <li>💰 Las ventas registran transacciones completas del sistema</li>
            <li>🔗 Conecta fechas, productos, clientes, tiendas y vendedores</li>
            <li>📊 El total se calcula automáticamente</li>
            <li>🏷️ Los descuentos reducen el monto final</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Ventas
