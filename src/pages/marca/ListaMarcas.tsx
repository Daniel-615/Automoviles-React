"use client"

import type React from "react"
import { useState, useEffect } from "react"
import "../../components/css/ListaMarcas.css"

interface MarcaItem {
  marca_key: number
  nombre_marca: string
}

interface ApiResponse {
  marcas: MarcaItem[]
  total: number
  pagina_actual: number
  total_paginas: number
}

const ListaMarcas: React.FC = () => {
  const [marcas, setMarcas] = useState<MarcaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<MarcaItem>>({})

  const fetchMarcas = async (page = 1) => {
    try {
      setLoading(true)
      const response = await fetch(
        `https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/get/marca?page=${page}&per_page=10`,
      )

      if (!response.ok) {
        throw new Error("Error al cargar las marcas")
      }

      const data: ApiResponse = await response.json()
      setMarcas(data.marcas)
      setCurrentPage(data.pagina_actual)
      setTotalPages(data.total_paginas)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarcas(currentPage)
  }, [currentPage])

  const handleEdit = (marca: MarcaItem) => {
    setEditingId(marca.marca_key)
    setEditData(marca)
  }

  const handleSave = async () => {
    if (!editingId) return

    try {
      const response = await fetch(
        `https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/put/marca/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editData),
        },
      )

      if (response.ok) {
        await fetchMarcas(currentPage)
        setEditingId(null)
        setEditData({})
      } else {
        throw new Error("Error al actualizar la marca")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar")
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta marca?")) {
      return
    }

    try {
      const response = await fetch(
        `https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/delete/marca/${id}`,
        {
          method: "DELETE",
        },
      )

      if (response.ok) {
        await fetchMarcas(currentPage)
      } else {
        throw new Error("Error al eliminar la marca")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar")
    }
  }

  const filteredMarcas = marcas.filter((marca) => marca.nombre_marca.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando marcas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <span className="error-icon">❌</span>
        <p>{error}</p>
        <button onClick={() => fetchMarcas(currentPage)} className="retry-btn">
          🔄 Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="lista-marcas-container">
      <div className="lista-header">
        <h1>🏭 Lista de Marcas</h1>
        <div className="header-actions">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar marcas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="marcas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre de la Marca</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredMarcas.map((marca) => (
              <tr key={marca.marca_key}>
                <td>{marca.marca_key}</td>
                <td>
                  {editingId === marca.marca_key ? (
                    <input
                      type="text"
                      value={editData.nombre_marca || ""}
                      onChange={(e) => setEditData({ ...editData, nombre_marca: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    <span className="marca-name">🏷️ {marca.nombre_marca}</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    {editingId === marca.marca_key ? (
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
                        <button onClick={() => handleEdit(marca)} className="edit-btn">
                          ✏️ Editar
                        </button>
                        <button onClick={() => handleDelete(marca.marca_key)} className="delete-btn">
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

export default ListaMarcas
