"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import "../../components/css/marca.css"

interface Marca {
  id_marca: number
  nombre_marca: string
  pais_origen: string
  descripcion: string
}

const Marca: React.FC = () => {
  const [marca, setMarca] = useState<Marca>({
    id_marca: 0,
    nombre_marca: "",
    pais_origen: "",
    descripcion: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)

  useEffect(() => {
    if (isEditing) {
      fetchMarca()
    }
  }, [id, isEditing])

  const fetchMarca = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`http://localhost:8080/api/marcas/${id}`)
      setMarca(response.data)
    } catch (error) {
      console.error("Error fetching marca:", error)
      setError("Error al cargar la marca")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (isEditing) {
        await axios.put(`http://localhost:8080/api/marcas/${id}`, marca)
        setSuccess("Marca actualizada exitosamente")
      } else {
        await axios.post("http://localhost:8080/api/marcas", marca)
        setSuccess("Marca creada exitosamente")
        setMarca({ id_marca: 0, nombre_marca: "", pais_origen: "", descripcion: "" })
      }

      setTimeout(() => {
        navigate("/marcas")
      }, 1500)
    } catch (error) {
      console.error("Error saving marca:", error)
      setError("Error al guardar la marca")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setMarca((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  if (loading && isEditing) {
    return (
      <div className="marca-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando marca...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="marca-page">
      <div className="marca-container">
        {/* Header */}
        <div className="marca-header">
          <h1 className="marca-title">{isEditing ? "Editar Marca" : "Gestión de Marcas"}</h1>
        </div>

        {/* Search Section (solo para búsqueda por ID si es edición) */}
        {!isEditing && (
          <div className="search-section">
            <input type="text" placeholder="Buscar marca por ID" className="search-input" readOnly />
            <button className="search-btn">Buscar</button>
          </div>
        )}

        {/* Form Section */}
        <div className="form-section">
          <form onSubmit={handleSubmit} className="marca-form">
            <div className="form-grid">
              <div className="form-group">
                <input
                  type="text"
                  name="nombre_marca"
                  value={marca.nombre_marca}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Nombre de la Marca"
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="pais_origen"
                  value={marca.pais_origen}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="País de Origen"
                  required
                />
              </div>

              <div className="form-group full-width">
                <textarea
                  name="descripcion"
                  value={marca.descripcion}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Descripción de la marca"
                  rows={3}
                />
              </div>
            </div>

            {/* Alerts */}
            {error && <div className="alert alert-error">{error}</div>}

            {success && <div className="alert alert-success">{success}</div>}

            {/* Form Actions */}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Procesando..." : isEditing ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>

          {/* Navigation Button */}
          <div className="navigation-section">
            <button type="button" onClick={() => navigate("/marcas")} className="btn btn-secondary">
              Ir al listado
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Marca
