"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import "../../components/css/marca.css"

interface MarcaData {
  nombre_marca: string
}

const Marca: React.FC = () => {
  const [formData, setFormData] = useState<MarcaData>({
    nombre_marca: "",
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch(
        "https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/post/marca",
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
        setMessage({ text: "Marca creada exitosamente", type: "success" })
        setFormData({ nombre_marca: "" })
      } else {
        setMessage({ text: data.message || "Error al crear la marca", type: "error" })
      }
    } catch (error) {
      setMessage({ text: "Error de conexión", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({ nombre_marca: "" })
    setMessage(null)
  }

  return (
    <div className="marca-container">
      {/* Header con navegación */}
      <div className="marca-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="page-title">
              <span className="title-icon">🏭</span>
              Gestión de Marcas
            </h1>
            <p className="page-subtitle">Administra las marcas de vehículos del sistema</p>
          </div>

          <div className="header-actions">
            <Link to="/lista-marcas" className="btn btn-outline">
              <span className="btn-icon">📋</span>
              Ver Lista de Marcas
            </Link>
          </div>
        </div>
      </div>

      <div className="marca-content">
        {/* Formulario principal */}
        <div className="marca-form-card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">➕</span>
              Nueva Marca
            </h2>
            <p className="card-subtitle">Registra una nueva marca de vehículos</p>
          </div>

          <form onSubmit={handleSubmit} className="marca-form">
            <div className="form-group">
              <label htmlFor="nombre_marca" className="form-label">
                <span className="label-icon">🏷️</span>
                Nombre de la Marca
                <span className="required">*</span>
              </label>
              <input
                type="text"
                id="nombre_marca"
                name="nombre_marca"
                value={formData.nombre_marca}
                onChange={handleInputChange}
                required
                placeholder="Ej: Toyota, Honda, Ford, BMW..."
                className="form-input"
              />
              <div className="input-hint">Ingresa el nombre oficial de la marca de vehículos</div>
            </div>

            {message && (
              <div className={`alert alert-${message.type}`}>
                <span className="alert-icon">{message.type === "success" ? "✅" : "❌"}</span>
                <span className="alert-text">{message.text}</span>
              </div>
            )}

            <div className="form-actions">
              <button type="button" onClick={handleReset} className="btn btn-secondary" disabled={loading}>
                <span className="btn-icon">🔄</span>
                Limpiar
              </button>

              <button type="submit" disabled={loading || !formData.nombre_marca.trim()} className="btn btn-primary">
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Creando...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">💾</span>
                    Crear Marca
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Panel de información */}
        <div className="info-panel">
          <div className="info-header">
            <h3 className="info-title">
              <span className="info-icon">💡</span>
              Información sobre Marcas
            </h3>
          </div>

          <div className="info-content">
            <div className="info-item">
              <span className="item-icon">🚗</span>
              <div className="item-text">
                <strong>Fabricantes:</strong> Las marcas representan los fabricantes de vehículos
              </div>
            </div>

            <div className="info-item">
              <span className="item-icon">📝</span>
              <div className="item-text">
                <strong>Unicidad:</strong> El nombre debe ser único en el sistema
              </div>
            </div>

            <div className="info-item">
              <span className="item-icon">🔗</span>
              <div className="item-text">
                <strong>Relaciones:</strong> Las marcas se relacionan con los modelos de vehículos
              </div>
            </div>

            <div className="info-item">
              <span className="item-icon">✨</span>
              <div className="item-text">
                <strong>Ejemplos:</strong> Toyota, Honda, Ford, BMW, Mercedes-Benz, Audi
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h4 className="quick-title">Acciones Rápidas</h4>
            <div className="quick-buttons">
              <Link to="/lista-marcas" className="quick-btn">
                <span className="quick-icon">📋</span>
                Ver Todas
              </Link>
              <Link to="/modelo" className="quick-btn">
                <span className="quick-icon">🚗</span>
                Crear Modelo
              </Link>
              <Link to="/producto" className="quick-btn">
                <span className="quick-icon">🚙</span>
                Crear Producto
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Marca
