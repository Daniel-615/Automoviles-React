"use client"

import type React from "react"
import { useState, useEffect } from "react"
import "../../components/css/ListaFechas.css"

interface FechaItem {
  fecha_key: number
  fecha_completa: string
  dia: number
  dia_semana: string
  semana: number
  mes: string
  trimestre: number
  ano: number
  indicador_fin_semana: boolean
  indicador_feriado: boolean
}

interface ApiResponse {
  fechas: FechaItem[]
  total: number
  pagina_actual: number
  total_paginas: number
}

const ListaFechas: React.FC = () => {
  const [fechas, setFechas] = useState<FechaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<FechaItem>>({})

  const fetchFechas = async (page = 1) => {
    try {
      setLoading(true)
      const response = await fetch(
        `https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/get/fecha?page=${page}&per_page=10`,
      )

      if (!response.ok) {
        throw new Error("Error al cargar las fechas")
      }

      const data: ApiResponse = await response.json()
      setFechas(data.fechas)
      setCurrentPage(data.pagina_actual)
      setTotalPages(data.total_paginas)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFechas(currentPage)
  }, [currentPage])

  const handleEdit = (fecha: FechaItem) => {
    setEditingId(fecha.fecha_key)
    setEditData(fecha)
  }

  const handleSave = async () => {
    if (!editingId) return

    try {
      const response = await fetch(
        `https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/put/fecha/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editData),
        },
      )

      if (response.ok) {
        await fetchFechas(currentPage)
        setEditingId(null)
        setEditData({})
      } else {
        throw new Error("Error al actualizar la fecha")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar")
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta fecha?")) {
      return
    }

    try {
      const response = await fetch(
        `https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/delete/fecha/${id}`,
        {
          method: "DELETE",
        },
      )

      if (response.ok) {
        await fetchFechas(currentPage)
      } else {
        throw new Error("Error al eliminar la fecha")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar")
    }
  }

  const handleNavigateToCreate = () => {
    window.location.href = "/fecha"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getDateBadgeClass = (fecha: FechaItem) => {
    if (fecha.indicador_feriado) return "holiday"
    if (fecha.indicador_fin_semana) return "weekend"
    return "weekday"
  }

  const filteredFechas = fechas.filter(
    (fecha) =>
      fecha.fecha_completa.includes(searchTerm) ||
      fecha.dia_semana.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fecha.mes.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="lista-fechas-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>✨ Cargando fechas mágicas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="lista-fechas-container">
        <div className="error-container">
          <span className="error-icon">🚨</span>
          <p>{error}</p>
          <button onClick={() => fetchFechas(currentPage)} className="retry-btn">
            🔄 Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="lista-fechas-container">
      <div className="lista-header">
        <h1>📅 Lista de Fechas</h1>
        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar fechas mágicas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <button onClick={handleNavigateToCreate} className="create-btn">
            ✨ Crear Nueva Fecha
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="fechas-table">
          <thead>
            <tr>
              <th>🆔 ID</th>
              <th>📅 Fecha</th>
              <th>📆 Día</th>
              <th>🗓️ Día Semana</th>
              <th>📊 Semana</th>
              <th>🗓️ Mes</th>
              <th>📈 Trimestre</th>
              <th>📅 Año</th>
              <th>🏖️ Fin Semana</th>
              <th>🎉 Feriado</th>
              <th>⚡ Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredFechas.map((fecha) => (
              <tr key={fecha.fecha_key}>
                <td>
                  <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "#6b7280" }}>
                    {fecha.fecha_key}
                  </span>
                </td>
                <td>
                  <span className={`date-badge ${getDateBadgeClass(fecha)}`}>
                    📅 {formatDate(fecha.fecha_completa)}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: "1.1rem", fontWeight: "600" }}>{fecha.dia}</span>
                </td>
                <td>
                  <span
                    style={{
                      padding: "4px 12px",
                      background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                      color: "white",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                    }}
                  >
                    {fecha.dia_semana}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      padding: "6px 12px",
                      background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                      color: "#374151",
                      borderRadius: "12px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                    }}
                  >
                    📊 {fecha.semana}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      padding: "6px 12px",
                      background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                      color: "#374151",
                      borderRadius: "12px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                    }}
                  >
                    🗓️ {fecha.mes}
                  </span>
                </td>
                <td>
                  <span className="quarter-badge">📈 Q{fecha.trimestre}</span>
                </td>
                <td>
                  <span
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "700",
                      color: "#374151",
                    }}
                  >
                    {fecha.ano}
                  </span>
                </td>
                <td>
                  <span className={`indicator ${fecha.indicador_fin_semana ? "active" : "inactive"}`}>
                    {fecha.indicador_fin_semana ? "🏖️" : "💼"}
                  </span>
                </td>
                <td>
                  <span className={`indicator ${fecha.indicador_feriado ? "active" : "inactive"}`}>
                    {fecha.indicador_feriado ? "🎉" : "📅"}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {editingId === fecha.fecha_key ? (
                      <>
                        <button onClick={handleSave} className="save-btn">
                          💾 Guardar
                        </button>
                        <button onClick={() => setEditingId(null)} className="cancel-btn">
                          ❌ Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(fecha)} className="edit-btn">
                          ✏️ Editar
                        </button>
                        <button onClick={() => handleDelete(fecha.fecha_key)} className="delete-btn">
                          🗑️ Eliminar
                        </button>
                      </>
                    )}
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

export default ListaFechas
