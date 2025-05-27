"use client"

import type React from "react"
import { useState, useEffect } from "react"
import "../../components/css/ListaProductos.css"

interface ProductoItem {
  producto_key: number
  nombre_producto: string
  descripcion: string
  modelo_key: number
  ano_fabricacion: number
  color: string
  precio_lista: number
  categoria_key: number
}

interface ModeloItem {
  modelo_key: number
  nombre_modelo: string
}

interface CategoriaItem {
  categoria_key: number
  nombre_categoria: string
}

interface ApiResponse {
  productos: ProductoItem[]
  total: number
  pagina_actual: number
  total_paginas: number
}

const ListaProductos: React.FC = () => {
  const [productos, setProductos] = useState<ProductoItem[]>([])
  const [modelos, setModelos] = useState<ModeloItem[]>([])
  const [categorias, setCategorias] = useState<CategoriaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<Partial<ProductoItem>>({})

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchProductos(currentPage)
  }, [currentPage])

  const fetchData = async () => {
    try {
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
    }
  }

  const fetchProductos = async (page = 1) => {
    try {
      setLoading(true)
      const response = await fetch(
        `https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/get/producto?page=${page}&per_page=10`,
      )

      if (!response.ok) {
        throw new Error("Error al cargar los productos")
      }

      const data: ApiResponse = await response.json()
      setProductos(data.productos)
      setCurrentPage(data.pagina_actual)
      setTotalPages(data.total_paginas)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const getModeloNombre = (modeloKey: number): string => {
    const modelo = modelos.find((m) => m.modelo_key === modeloKey)
    return modelo ? modelo.nombre_modelo : "Modelo no encontrado"
  }

  const getCategoriaNombre = (categoriaKey: number): string => {
    const categoria = categorias.find((c) => c.categoria_key === categoriaKey)
    return categoria ? categoria.nombre_categoria : "Categoría no encontrada"
  }

  const handleEdit = (producto: ProductoItem) => {
    setEditingId(producto.producto_key)
    setEditData(producto)
  }

  const handleSave = async () => {
    if (!editingId) return

    try {
      const response = await fetch(
        `https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/put/producto/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editData),
        },
      )

      if (response.ok) {
        await fetchProductos(currentPage)
        setEditingId(null)
        setEditData({})
      } else {
        throw new Error("Error al actualizar el producto")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar")
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return
    }

    try {
      const response = await fetch(
        `https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/delete/producto/${id}`,
        {
          method: "DELETE",
        },
      )

      if (response.ok) {
        await fetchProductos(currentPage)
      } else {
        throw new Error("Error al eliminar el producto")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar")
    }
  }

  const handleNavigateToCreate = () => {
    window.location.href = "/producto"
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(price)
  }

  const filteredProductos = productos.filter(
    (producto) =>
      producto.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getModeloNombre(producto.modelo_key).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoriaNombre(producto.categoria_key).toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando productos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <p>{error}</p>
        <button onClick={() => fetchProductos(currentPage)} className="retry-btn">
          🔄 Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="lista-productos-container">
      <div className="lista-header">
        <div className="header-content">
          <h1>🚙 Lista de Productos</h1>
          <p>Gestiona el catálogo completo de vehículos</p>
        </div>
        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button onClick={handleNavigateToCreate} className="create-btn">
            ➕ Crear Producto
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="productos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Modelo</th>
              <th>Categoría</th>
              <th>Año</th>
              <th>Color</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProductos.map((producto) => (
              <tr key={producto.producto_key}>
                <td>
                  <span className="id-badge">{producto.producto_key}</span>
                </td>
                <td>
                  {editingId === producto.producto_key ? (
                    <input
                      type="text"
                      value={editData.nombre_producto || ""}
                      onChange={(e) => setEditData({ ...editData, nombre_producto: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    <span className="producto-name">{producto.nombre_producto}</span>
                  )}
                </td>
                <td>
                  {editingId === producto.producto_key ? (
                    <select
                      value={editData.modelo_key || ""}
                      onChange={(e) => setEditData({ ...editData, modelo_key: Number.parseInt(e.target.value) })}
                      className="edit-select"
                    >
                      {modelos.map((modelo) => (
                        <option key={modelo.modelo_key} value={modelo.modelo_key}>
                          {modelo.nombre_modelo}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="modelo-badge">{getModeloNombre(producto.modelo_key)}</span>
                  )}
                </td>
                <td>
                  {editingId === producto.producto_key ? (
                    <select
                      value={editData.categoria_key || ""}
                      onChange={(e) => setEditData({ ...editData, categoria_key: Number.parseInt(e.target.value) })}
                      className="edit-select"
                    >
                      {categorias.map((categoria) => (
                        <option key={categoria.categoria_key} value={categoria.categoria_key}>
                          {categoria.nombre_categoria}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="categoria-badge">{getCategoriaNombre(producto.categoria_key)}</span>
                  )}
                </td>
                <td>
                  {editingId === producto.producto_key ? (
                    <input
                      type="number"
                      value={editData.ano_fabricacion || ""}
                      onChange={(e) => setEditData({ ...editData, ano_fabricacion: Number.parseInt(e.target.value) })}
                      className="edit-input"
                      min="1900"
                      max={new Date().getFullYear() + 5}
                    />
                  ) : (
                    <span className="year-badge">{producto.ano_fabricacion}</span>
                  )}
                </td>
                <td>
                  {editingId === producto.producto_key ? (
                    <input
                      type="text"
                      value={editData.color || ""}
                      onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    <span className="color-badge">{producto.color || "N/A"}</span>
                  )}
                </td>
                <td>
                  {editingId === producto.producto_key ? (
                    <input
                      type="number"
                      value={editData.precio_lista || ""}
                      onChange={(e) => setEditData({ ...editData, precio_lista: Number.parseFloat(e.target.value) })}
                      className="edit-input"
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    <span className="price-badge">{formatPrice(producto.precio_lista)}</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    {editingId === producto.producto_key ? (
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
                        <button onClick={() => handleEdit(producto)} className="edit-btn">
                          ✏️ Editar
                        </button>
                        <button onClick={() => handleDelete(producto.producto_key)} className="delete-btn">
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

export default ListaProductos
