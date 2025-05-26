"use client"

import type React from "react"
import { useState, useEffect } from "react"
import "../../components/css/ListaModelos.css"

interface ModeloItem {
  modelo_key: number
  nombre_modelo: string
  ano_lanzamiento: number
  marca_key: number
}

interface MarcaItem {
  marca_key: number
  nombre_marca: string
}

interface ApiResponse {
  modelos: ModeloItem[]
  total: number
  pagina_actual: number
  total_paginas: number
}

const ListaModelos: React.FC = () => {
  const [modelos, setModelos] = useState<ModeloItem[]>([])
  const [marcas, setMarcas] = useState<MarcaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<ModeloItem>>({})

  useEffect(() => {
    fetchMarcas()
  }, [])

  useEffect(() => {
    fetchModelos(currentPage)
  }, [currentPage])

  const fetchMarcas = async () => {
    try {
      const response = await fetch(
        "https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/get/marca?per_page=100",
      )

      if (response.ok) {
        const data = await response.json()
        setMarcas(data.marcas || [])
      }
    } catch (error) {
      console.error("Error al cargar marcas:", error)
    }
  }

  const fetchModelos = async (page = 1) => {
    try {
      setLoading(true)
      const response = await fetch(
        `https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/get/modelo?page=${page}&per_page=10`,
      )

      if (!response.ok) {
        throw new Error("Error al cargar los modelos")
      }

      const data: ApiResponse = await response.json()
      setModelos(data.modelos)
      setCurrentPage(data.pagina_actual)
      setTotalPages(data.total_paginas)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const getMarcaNombre = (marcaKey: number): string => {
    const marca = marcas.find((m) => m.marca_key === marcaKey)
    return marca ? marca.nombre_marca : "Marca no encontrada"
  }

  const handleEdit = (modelo: ModeloItem) => {
    setEditingId(modelo.modelo_key)
    setEditData(modelo)
  }

  const handleSave = async () => {
    if (!editingId) return

    try {
      const response = await fetch(
        `https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/put/modelo/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editData),
        },
      )

      if (response.ok) {
        await fetchModelos(currentPage)
        setEditingId(null)
        setEditData({})
      } else {
        throw new Error("Error al actualizar el modelo")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar")
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este modelo?")) {
      return
    }

    try {
      const response = await fetch(
        `https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/delete/modelo/${id}`,
        {
          method: "DELETE",
        },
      )

      if (response.ok) {
        await fetchModelos(currentPage)
      } else {
        throw new Error("Error al eliminar el modelo")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar")
    }
  }

  const handleNavigateToCreate = () => {
    window.location.href = "/modelo"
  }

  const filteredModelos = modelos.filter(
    (modelo) =>
      modelo.nombre_modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getMarcaNombre(modelo.marca_key).toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando modelos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <span className="error-icon">❌</span>
        <p>{error}</p>
        <button onClick={() => fetchModelos(currentPage)} className="retry-btn">
          🔄 Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="lista-modelos-container">
      <div className="lista-header">
        <h1>🚗 Lista de Modelos</h1>
        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar modelos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <button onClick={handleNavigateToCreate} className="retry-btn">
            ➕ Crear Modelo
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="modelos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre del Modelo</th>
              <th>Año Lanzamiento</th>
              <th>Marca</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredModelos.map((modelo) => (
              <tr key={modelo.modelo_key}>
                <td>{modelo.modelo_key}</td>
                <td>
                  {editingId === modelo.modelo_key ? (
                    <input
                      type="text"
                      value={editData.nombre_modelo || ""}
                      onChange={(e) => setEditData({ ...editData, nombre_modelo: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    <span className="modelo-name">🚗 {modelo.nombre_modelo}</span>
                  )}
                </td>
                <td>
                  {editingId === modelo.modelo_key ? (
                    <input
                      type="number"
                      value={editData.ano_lanzamiento || ""}
                      onChange={(e) => setEditData({ ...editData, ano_lanzamiento: Number.parseInt(e.target.value) })}
                      className="edit-input"
                      min="1900"
                      max={new Date().getFullYear() + 5}
                    />
                  ) : (
                    <span className="year-badge">📅 {modelo.ano_lanzamiento}</span>
                  )}
                </td>
                <td>
                  {editingId === modelo.modelo_key ? (
                    <select
                      value={editData.marca_key || ""}
                      onChange={(e) => setEditData({ ...editData, marca_key: Number.parseInt(e.target.value) })}
                      className="edit-select"
                    >
                      {marcas.map((marca) => (
                        <option key={marca.marca_key} value={marca.marca_key}>
                          {marca.nombre_marca}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="marca-badge">🏭 {getMarcaNombre(modelo.marca_key)}</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    {editingId === modelo.modelo_key ? (
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
                        <button onClick={() => handleEdit(modelo)} className="edit-btn">
                          ✏️ Editar
                        </button>
                        <button onClick={() => handleDelete(modelo.modelo_key)} className="delete-btn">
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

export default ListaModelos
