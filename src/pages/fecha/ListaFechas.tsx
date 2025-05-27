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
  const [totalRecords, setTotalRecords] = useState(0)
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
      setTotalRecords(data.total)
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

  const getStatsData = () => {
    const weekends = fechas.filter((f) => f.indicador_fin_semana).length
    const holidays = fechas.filter((f) => f.indicador_feriado).length
    const weekdays = fechas.length - weekends

    return { weekends, holidays, weekdays, total: fechas.length }
  }

  const stats = getStatsData()

  if (loading) {
    return (
      <div className="lista-fechas-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">
            <h3>Cargando Fechas</h3>
            <p>Procesando información temporal...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="lista-fechas-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <h3>Error de Conexión</h3>
            <p>{error}</p>
            <button onClick={() => fetchFechas(currentPage)} className="retry-btn">
              <span className="btn-icon">🔄</span>
              Reintentar Carga
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lista-fechas-container">
      {/* Header Principal */}
      <div className="main-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="main-title">
              <span className="title-icon">📅</span>
              Gestión de Fechas
            </h1>
            <p className="subtitle">Sistema de administración temporal avanzado</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <span className="stat-number">{totalRecords}</span>
                <span className="stat-label">Total Fechas</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💼</div>
              <div className="stat-content">
                <span className="stat-number">{stats.weekdays}</span>
                <span className="stat-label">Días Laborales</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏖️</div>
              <div className="stat-content">
                <span className="stat-number">{stats.weekends}</span>
                <span className="stat-label">Fines de Semana</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎉</div>
              <div className="stat-content">
                <span className="stat-number">{stats.holidays}</span>
                <span className="stat-label">Feriados</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de Acción */}
      <div className="controls-section">
        <div className="search-container">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Buscar por fecha, día o mes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="search-icon">🔍</div>
          </div>
        </div>

        <button onClick={handleNavigateToCreate} className="create-btn">
          <span className="btn-icon">✨</span>
          Nueva Fecha
        </button>
      </div>

      {/* Tabla de Fechas */}
      <div className="table-section">
        <div className="table-container">
          <table className="fechas-table">
            <thead>
              <tr>
                <th>
                  <span className="th-content">
                    <span className="th-icon">🆔</span>ID
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">📅</span>Fecha Completa
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">📆</span>Día
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">🗓️</span>Día Semana
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">📊</span>Semana
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">🗓️</span>Mes
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">📈</span>Trimestre
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">📅</span>Año
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">🏖️</span>Fin Semana
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">🎉</span>Feriado
                  </span>
                </th>
                <th>
                  <span className="th-content">
                    <span className="th-icon">⚡</span>Acciones
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredFechas.map((fecha, index) => (
                <tr key={fecha.fecha_key} className={index % 2 === 0 ? "row-even" : "row-odd"}>
                  <td>
                    <div className="id-badge">{fecha.fecha_key}</div>
                  </td>
                  <td>
                    <div className={`date-badge ${getDateBadgeClass(fecha)}`}>
                      <span className="date-icon">📅</span>
                      <span className="date-text">{formatDate(fecha.fecha_completa)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="day-badge">{fecha.dia}</div>
                  </td>
                  <td>
                    <div className="weekday-badge">
                      <span className="weekday-icon">🗓️</span>
                      <span className="weekday-text">{fecha.dia_semana}</span>
                    </div>
                  </td>
                  <td>
                    <div className="week-badge">
                      <span className="week-icon">📊</span>
                      <span className="week-text">S{fecha.semana}</span>
                    </div>
                  </td>
                  <td>
                    <div className="month-badge">
                      <span className="month-icon">🗓️</span>
                      <span className="month-text">{fecha.mes}</span>
                    </div>
                  </td>
                  <td>
                    <div className="quarter-badge">
                      <span className="quarter-icon">📈</span>
                      <span className="quarter-text">Q{fecha.trimestre}</span>
                    </div>
                  </td>
                  <td>
                    <div className="year-badge">{fecha.ano}</div>
                  </td>
                  <td>
                    <div className={`indicator-badge ${fecha.indicador_fin_semana ? "active" : "inactive"}`}>
                      <span className="indicator-icon">{fecha.indicador_fin_semana ? "🏖️" : "💼"}</span>
                      <span className="indicator-text">{fecha.indicador_fin_semana ? "Sí" : "No"}</span>
                    </div>
                  </td>
                  <td>
                    <div className={`indicator-badge ${fecha.indicador_feriado ? "active" : "inactive"}`}>
                      <span className="indicator-icon">{fecha.indicador_feriado ? "🎉" : "📅"}</span>
                      <span className="indicator-text">{fecha.indicador_feriado ? "Sí" : "No"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {editingId === fecha.fecha_key ? (
                        <>
                          <button onClick={handleSave} className="save-btn">
                            <span className="btn-icon">💾</span>
                            Guardar
                          </button>
                          <button onClick={() => setEditingId(null)} className="cancel-btn">
                            <span className="btn-icon">❌</span>
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(fecha)} className="edit-btn">
                            <span className="btn-icon">✏️</span>
                            Editar
                          </button>
                          <button onClick={() => handleDelete(fecha.fecha_key)} className="delete-btn">
                            <span className="btn-icon">🗑️</span>
                            Eliminar
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
      </div>

      {/* Paginación */}
      <div className="pagination-section">
        <div className="pagination-info">
          <span className="pagination-text">
            Mostrando {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalRecords)} de {totalRecords} fechas
          </span>
        </div>

        <div className="pagination-controls">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="pagination-btn first">
            <span className="btn-icon">⏮️</span>
            Primera
          </button>

          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn prev"
          >
            <span className="btn-icon">⬅️</span>
            Anterior
          </button>

          <div className="page-indicator">
            <span className="current-page">{currentPage}</span>
            <span className="page-separator">de</span>
            <span className="total-pages">{totalPages}</span>
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn next"
          >
            Siguiente
            <span className="btn-icon">➡️</span>
          </button>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="pagination-btn last"
          >
            Última
            <span className="btn-icon">⏭️</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ListaFechas
