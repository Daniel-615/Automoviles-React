"use client"

import type React from "react"
import { useState, useEffect } from "react"
import "../../components/css/modelo.css"

interface ModeloData {
  nombre_modelo: string
  año_lanzamiento: number
  marca_key: number
}

interface MarcaItem {
  marca_key: number
  nombre_marca: string
}

const Modelo: React.FC = () => {
  const [formData, setFormData] = useState<ModeloData>({
    nombre_modelo: "",
    año_lanzamiento: new Date().getFullYear(),
    marca_key: 0,
  })

  const [marcas, setMarcas] = useState<MarcaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMarcas, setLoadingMarcas] = useState(true)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    fetchMarcas()
  }, [])

  const fetchMarcas = async () => {
    try {
      setLoadingMarcas(true)
      const response = await fetch(
        "https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/get/marca?per_page=100",
      )

      if (response.ok) {
        const data = await response.json()
        setMarcas(data.marcas || [])
      }
    } catch (error) {
      console.error("Error al cargar marcas:", error)
    } finally {
      setLoadingMarcas(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (formData.marca_key === 0) {
      setMessage({ text: "Por favor selecciona una marca", type: "error" })
      setLoading(false)
      return
    }

    try {
      const response = await fetch(
        "https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/post/modelo",
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
        setMessage({ text: "Modelo creado exitosamente", type: "success" })
        setFormData({
          nombre_modelo: "",
          año_lanzamiento: new Date().getFullYear(),
          marca_key: 0,
        })
      } else {
        setMessage({ text: data.message || "Error al crear el modelo", type: "error" })
      }
    } catch (error) {
      setMessage({ text: "Error de conexión", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleNavigateToList = () => {
    window.location.href = "/lista-modelos"
  }

  return (
    <div className="modelo-page">
      <div className="modelo-container">
        <div className="modelo-header">
          <h1 className="modelo-title">Gestión de Modelos</h1>
          <p className="modelo-subtitle">Administra los modelos de vehículos del sistema</p>
        </div>

        <div className="modelo-form-container">
          <form onSubmit={handleSubmit} className="modelo-form">
            <div className="form-group full-width">
              <label htmlFor="nombre_modelo" className="form-label">
                Nombre del Modelo *
              </label>
              <input
                type="text"
                id="nombre_modelo"
                name="nombre_modelo"
                value={formData.nombre_modelo}
                onChange={handleInputChange}
                required
                placeholder="Ej: Corolla, Civic, Mustang, X5..."
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="año_lanzamiento" className="form-label">
                  Año de Lanzamiento *
                </label>
                <input
                  type="number"
                  id="año_lanzamiento"
                  name="año_lanzamiento"
                  value={formData.año_lanzamiento}
                  onChange={handleInputChange}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 5}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="marca_key" className="form-label">
                  Marca *
                </label>
                {loadingMarcas ? (
                  <div className="form-input" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div className="loading-spinner"></div>
                    Cargando marcas...
                  </div>
                ) : (
                  <select
                    id="marca_key"
                    name="marca_key"
                    value={formData.marca_key}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value={0}>Selecciona una marca</option>
                    {marcas.map((marca) => (
                      <option key={marca.marca_key} value={marca.marca_key}>
                        {marca.nombre_marca}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            <div className="form-actions">
              <button type="button" onClick={handleNavigateToList} className="btn btn-secondary">
                Ir al listado
              </button>
              <button type="submit" disabled={loading || loadingMarcas} className="btn btn-primary">
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Creando...
                  </>
                ) : (
                  "Crear"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Modelo
