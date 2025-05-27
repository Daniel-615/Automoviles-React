"use client"

import type React from "react"
import { useState, useEffect } from "react"
import "../../components/css/producto.css"

interface ProductoData {
  nombre_producto: string
  descripcion: string
  modelo_key: number
  año_fabricacion: number
  color: string
  precio_lista: number
  categoria_key: number
}

interface ModeloItem {
  modelo_key: number
  nombre_modelo: string
  marca_key: number
}

interface CategoriaItem {
  categoria_key: number
  nombre_categoria: string
}

const Producto: React.FC = () => {
  const [formData, setFormData] = useState<ProductoData>({
    nombre_producto: "",
    descripcion: "",
    modelo_key: 0,
    año_fabricacion: new Date().getFullYear(),
    color: "",
    precio_lista: 0,
    categoria_key: 0,
  })

  const [modelos, setModelos] = useState<ModeloItem[]>([])
  const [categorias, setCategorias] = useState<CategoriaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoadingData(true)

      // Fetch modelos
      const modelosResponse = await fetch(
        "https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/get/modelo?per_page=100",
      )

      if (modelosResponse.ok) {
        const modelosData = await modelosResponse.json()
        setModelos(modelosData.modelos || [])
      }

      // Fetch categorias
      const categoriasResponse = await fetch(
        "https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/get/categorias?per_page=100",
      )

      if (categoriasResponse.ok) {
        const categoriasData = await categoriasResponse.json()
        setCategorias(categoriasData.categorias || [])
      }
    } catch (error) {
      console.error("Error al cargar datos:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (formData.modelo_key === 0 || formData.categoria_key === 0) {
      setMessage({ text: "Por favor selecciona un modelo y una categoría", type: "error" })
      setLoading(false)
      return
    }

    try {
      const response = await fetch(
        "https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/post/producto",
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
        setMessage({ text: "Producto creado exitosamente", type: "success" })
        setFormData({
          nombre_producto: "",
          descripcion: "",
          modelo_key: 0,
          año_fabricacion: new Date().getFullYear(),
          color: "",
          precio_lista: 0,
          categoria_key: 0,
        })
      } else {
        setMessage({ text: data.message || "Error al crear el producto", type: "error" })
      }
    } catch (error) {
      setMessage({ text: "Error de conexión", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleNavigateToList = () => {
    window.location.href = "/lista-productos"
  }

  return (
    <div className="producto-container">
      <div className="producto-header">
        <div className="header-content">
          <h1>🚙 Gestión de Productos</h1>
          <p>Administra los productos del catálogo de vehículos</p>
        </div>
      </div>

      <div className="producto-form-container">
        <div className="navigation-section">
          <button onClick={handleNavigateToList} className="nav-btn">
            📋 Ver Lista de Productos
          </button>
        </div>

        <form onSubmit={handleSubmit} className="producto-form">
          <div className="form-group full-width">
            <label htmlFor="nombre_producto">🏷️ Nombre del Producto *</label>
            <input
              type="text"
              id="nombre_producto"
              name="nombre_producto"
              value={formData.nombre_producto}
              onChange={handleInputChange}
              required
              placeholder="Ej: Toyota Corolla 2024 Sedán..."
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="descripcion">📄 Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Descripción detallada del producto..."
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="modelo_key">🚗 Modelo *</label>
              {loadingData ? (
                <div className="loading-select">
                  <div className="loading-spinner"></div>
                  Cargando modelos...
                </div>
              ) : (
                <select
                  id="modelo_key"
                  name="modelo_key"
                  value={formData.modelo_key}
                  onChange={handleInputChange}
                  required
                >
                  <option value={0}>Selecciona un modelo</option>
                  {modelos.map((modelo) => (
                    <option key={modelo.modelo_key} value={modelo.modelo_key}>
                      {modelo.nombre_modelo}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="categoria_key">🏷️ Categoría *</label>
              {loadingData ? (
                <div className="loading-select">
                  <div className="loading-spinner"></div>
                  Cargando categorías...
                </div>
              ) : (
                <select
                  id="categoria_key"
                  name="categoria_key"
                  value={formData.categoria_key}
                  onChange={handleInputChange}
                  required
                >
                  <option value={0}>Selecciona una categoría</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.categoria_key} value={categoria.categoria_key}>
                      {categoria.nombre_categoria}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="año_fabricacion">📅 Año de Fabricación *</label>
              <input
                type="number"
                id="año_fabricacion"
                name="año_fabricacion"
                value={formData.año_fabricacion}
                onChange={handleInputChange}
                required
                min="1900"
                max={new Date().getFullYear() + 5}
              />
            </div>

            <div className="form-group">
              <label htmlFor="color">🎨 Color</label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="Ej: Rojo, Azul, Negro..."
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="precio_lista">💰 Precio de Lista *</label>
            <input
              type="number"
              id="precio_lista"
              name="precio_lista"
              value={formData.precio_lista}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              placeholder="0"
            />
          </div>

          {message && (
            <div className={`message ${message.type}`}>
              <div className="message-icon">{message.type === "success" ? "✅" : "❌"}</div>
              <span>{message.text}</span>
            </div>
          )}

          <button type="submit" disabled={loading || loadingData} className="submit-btn">
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Creando...
              </>
            ) : (
              <>💾 Crear Producto</>
            )}
          </button>
        </form>

        <div className="producto-info">
          <h3>💡 Información sobre Productos</h3>
          <ul>
            <li>🚙 Los productos representan vehículos específicos del inventario</li>
            <li>🔗 Cada producto pertenece a un modelo y una categoría</li>
            <li>💰 El precio de lista es el precio base del vehículo</li>
            <li>🎨 El color es opcional pero recomendado para identificación</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Producto
