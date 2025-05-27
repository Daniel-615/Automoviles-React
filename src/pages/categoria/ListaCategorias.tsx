"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../../components/css/ListaCategorias.css"

interface CategoriaItem {
  categoria_key: number
  nombre_categoria: string
  descripcion: string
  categoria_padre: string
}

interface PaginationResponse {
  categorias: CategoriaItem[]
  total: number
  pagina_actual: number
  total_paginas: number
  elementos_por_pagina: number
}

const ListaCategorias: React.FC = () => {
  const [categorias, setCategorias] = useState<CategoriaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPagina, setLoadingPagina] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalElementos, setTotalElementos] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const elementosPorPagina = 6
  const navigate = useNavigate()

  const fetchCategorias = async (page = 1) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingPagina(true)
      }

      console.log(`📄 Cargando página ${page}: /get/categorias?page=${page}&per_page=${elementosPorPagina}`)

      const response = await fetch(
        `https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/get/categorias?page=${page}&per_page=${elementosPorPagina}`,
      )

      if (!response.ok) {
        throw new Error("Error al cargar las categorías")
      }

      const data: PaginationResponse = await response.json()
      console.log("📊 Respuesta del API:", data)

      // Extraer datos de diferentes estructuras posibles
      const categoriasData = data.categorias || data
      const total = data.total || categoriasData.length
      const totalPags = data.total_paginas || Math.ceil(total / elementosPorPagina)

      setCategorias(Array.isArray(categoriasData) ? categoriasData : [])
      setTotalElementos(total)
      setTotalPaginas(totalPags)
      setPaginaActual(page)

      console.log(`✅ Cargadas ${categoriasData.length} categorías de ${total} totales`)
    } catch (err) {
      console.error("❌ Error al cargar categorías:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
      setLoadingPagina(false)
    }
  }

  useEffect(() => {
    fetchCategorias(paginaActual)
  }, [paginaActual])

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas && nuevaPagina !== paginaActual) {
      setPaginaActual(nuevaPagina)
      // Scroll suave al top
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const generarNumerosPagina = () => {
    const numeros: number[] = []
    const maxVisible = 5
    let inicio = Math.max(1, paginaActual - Math.floor(maxVisible / 2))
    const fin = Math.min(totalPaginas, inicio + maxVisible - 1)

    if (fin - inicio + 1 < maxVisible) {
      inicio = Math.max(1, fin - maxVisible + 1)
    }

    for (let i = inicio; i <= fin; i++) {
      numeros.push(i)
    }
    return numeros
  }

  const filteredCategorias = categorias.filter(
    (categoria) =>
      categoria.nombre_categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        <button onClick={() => fetchCategorias(paginaActual)} className="retry-btn">
          Reintentar
        </button>
      </div>
    )
  }

  const inicioElementos = (paginaActual - 1) * elementosPorPagina + 1
  const finElementos = Math.min(paginaActual * elementosPorPagina, totalElementos)

  return (
    <div className="lista-container">
      <div className="lista-header">
        <h1>📂 Lista de Categorías</h1>
        <div className="header-info">
          <span>
            Total de categorías: {totalElementos} • Página {paginaActual} de {totalPaginas}
          </span>
        </div>
        <button className="btn-volver" onClick={() => navigate("/categoria")}>
          ← Volver a Gestión
        </button>
      </div>

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

      {filteredCategorias.length === 0 ? (
        <p className="mensaje-vacio">No hay categorías registradas.</p>
      ) : (
        <>
          <div className="elementos-info">
            Mostrando {inicioElementos}-{finElementos} de {totalElementos} categorías
          </div>

          <div
            className={`tarjetas-vendedores ${loadingPagina ? "loading" : ""}`}
            style={{ opacity: loadingPagina ? 0.6 : 1 }}
          >
            {filteredCategorias.map((categoria, index) => (
              <div
                className="tarjeta"
                key={categoria.categoria_key}
                onClick={() => navigate(`/categoria/${categoria.categoria_key}`)}
                style={{
                  cursor: "pointer",
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <h3>📂 {categoria.nombre_categoria}</h3>
                <div className="categoria-info">
                  <p>
                    <strong>ID:</strong> {categoria.categoria_key}
                  </p>
                  <p>
                    <strong>Descripción:</strong> {categoria.descripcion || "Sin descripción"}
                  </p>
                  <p>
                    <strong>Categoría Padre:</strong> {categoria.categoria_padre || "Ninguna"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="pagination">
              <button
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1 || loadingPagina}
                className="pagination-btn"
              >
                ⬅️ Anterior
              </button>

              <div className="pagination-numbers">
                {generarNumerosPagina().map((numero) => (
                  <button
                    key={numero}
                    onClick={() => cambiarPagina(numero)}
                    disabled={loadingPagina}
                    className={`pagination-number ${numero === paginaActual ? "active" : ""}`}
                  >
                    {numero}
                  </button>
                ))}
              </div>

              <button
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas || loadingPagina}
                className="pagination-btn"
              >
                Siguiente ➡️
              </button>
            </div>
          )}

          <div className="pagination-info">
            Página {paginaActual} de {totalPaginas} • {totalElementos} categorías en total
          </div>
        </>
      )}
    </div>
  )
}

export default ListaCategorias
