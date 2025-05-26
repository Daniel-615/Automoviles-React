"use client"

import type React from "react"
import { useState, useEffect } from "react"
import "../../components/css/ListaCategorias.css"

interface CategoriaItem {
  categoria_key: number
  nombre_categoria: string
  descripcion: string
  categoria_padre: string
}

interface ApiResponse {
  categorias: CategoriaItem[]
  total: number
  pagina_actual: number
  total_paginas: number
}

const ListaCategorias: React.FC = () => {
  const [categorias, setCategorias] = useState<CategoriaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<CategoriaItem>>({})

  const fetchCategorias = async (page = 1) => {
    try {
      setLoading(true)
      const response = await fetch(
        `https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/get/categorias?page=${page}&per_page=10`,
      )

      if (!response.ok) {
        throw new Error("Error al cargar las categorías")
      }

      const data: ApiResponse = await response.json()
      setCategorias(data.categorias)
      setCurrentPage(data.pagina_actual)
      setTotalPages(data.total_paginas)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategorias(currentPage)
  }, [currentPage])

  const handleEdit = (categoria: CategoriaItem) => {
    setEditingId(categoria.categoria_key)
    setEditData(categoria)
  }

  const handleSave = async () => {
    if (!editingId) return

    try {
      const response = await fetch(
        `https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/put/categoria/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editData),
        },
      )

      if (response.ok) {
        await fetchCategorias(currentPage)
        setEditingId(null)
        setEditData({})
      } else {
        throw new Error("Error al actualizar la categoría")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar")
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta categoría?")) {
      return
    }

    try {
      const response = await fetch(
        `https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/delete/categoria/${id}`,
        {
          method: "DELETE",
        },
      )

      if (response.ok) {
        await fetchCategorias(currentPage)
      } else {
        throw new Error("Error al eliminar la categoría")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar")
    }
  }

  const filteredCategorias = categorias.filter(
    (categoria) =>
      categoria.nombre_categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoria.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando categorías...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <span className="error-icon">❌</span>
        <p>{error}</p>
        <button onClick={() => fetchCategorias(currentPage)} className="retry-btn">
          🔄 Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="lista-categorias-container">
      <div className="lista-header">
        <h1>🏷️ Lista de Categorías</h1>
        <div className="header-actions">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="categorias-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Categoría Padre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategorias.map((categoria) => (
              <tr key={categoria.categoria_key}>
                <td>{categoria.categoria_key}</td>
                <td>
                  {editingId === categoria.categoria_key ? (
                    <input
                      type="text"
                      value={editData.nombre_categoria || ""}
                      onChange={(e) => setEditData({ ...editData, nombre_categoria: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    categoria.nombre_categoria
                  )}
                </td>
                <td>
                  {editingId === categoria.categoria_key ? (
                    <textarea
                      value={editData.descripcion || ""}
                      onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
                      className="edit-textarea"
                    />
                  ) : (
                    categoria.descripcion || "N/A"
                  )}
                </td>
                <td>
                  {editingId === categoria.categoria_key ? (
                    <input
                      type="text"
                      value={editData.categoria_padre || ""}
                      onChange={(e) => setEditData({ ...editData, categoria_padre: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    categoria.categoria_padre || "N/A"
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    {editingId === categoria.categoria_key ? (
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
                        <button onClick={() => handleEdit(categoria)} className="edit-btn">
                          ✏️ Editar
                        </button>
                        <button onClick={() => handleDelete(categoria.categoria_key)} className="delete-btn">
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

export default ListaCategorias
