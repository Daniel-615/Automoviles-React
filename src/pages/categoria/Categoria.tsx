"use client"

import type React from "react"
import { useState } from "react"
import "../../components/css/categoria.css"

interface CategoriaData {
  nombre_categoria: string
  descripcion: string
  categoria_padre: string | null
}

const Categoria: React.FC = () => {
  const [formData, setFormData] = useState<CategoriaData>({
    nombre_categoria: "",
    descripcion: "",
    categoria_padre: null,
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    // Preparar los datos, convirtiendo string vacío a null para categoria_padre
    const dataToSend = {
      ...formData,
      categoria_padre: formData.categoria_padre?.trim() === "" ? null : formData.categoria_padre,
    }

    try {
      const response = await fetch(
        "https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/post/categoria",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        },
      )

      const data = await response.json()

      if (response.ok) {
        setMessage({ text: "Categoría creada exitosamente", type: "success" })
        setFormData({
          nombre_categoria: "",
          descripcion: "",
          categoria_padre: null,
        })
      } else {
        setMessage({ text: data.message || "Error al crear la categoría", type: "error" })
      }
    } catch (error) {
      setMessage({ text: "Error de conexión", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="categoria-container">
      <div className="categoria-header">
        <h1>🏷️ Gestión de Categorías</h1>
        <p>Administra las categorías de productos del sistema</p>
      </div>

      <div className="categoria-form-container">
        <form onSubmit={handleSubmit} className="categoria-form">
          <div className="form-group">
            <label htmlFor="nombre_categoria">
              <span className="label-icon">📝</span>
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              id="nombre_categoria"
              name="nombre_categoria"
              value={formData.nombre_categoria}
              onChange={handleInputChange}
              required
              placeholder="Ej: Sedán, SUV, Deportivo..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">
              <span className="label-icon">📄</span>
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Descripción detallada de la categoría..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoria_padre">
              <span className="label-icon">🔗</span>
              Categoría Padre
            </label>
            <input
              type="text"
              id="categoria_padre"
              name="categoria_padre"
              value={formData.categoria_padre || ""}
              onChange={handleInputChange}
              placeholder="Categoría padre (opcional)"
            />
          </div>

          {message && (
            <div className={`message ${message.type}`}>
              <span className="message-icon">{message.type === "success" ? "✅" : "❌"}</span>
              {message.text}
            </div>
          )}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Creando...
              </>
            ) : (
              <>
                <span className="btn-icon">💾</span>
                Crear Categoría
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Categoria
