"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "../../components/css/ListaGerentes.css"

interface Gerente {
  gerente_key: string
  gerente_id: string
  nombre: string
}

interface PaginationResponse<T> {
  gerentes?: T[]
  data?: T[]
  total?: number
  total_pages?: number
  current_page?: number
  per_page?: number
  count?: number
  pages?: number
  page?: number
}

const PRIMARY_API = "https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas"
const FALLBACK_API = "http://localhost:5000/ventas"

const fetchWithFallback = async (endpoint: string) => {
  try {
    return await axios.get(`${PRIMARY_API}${endpoint}`)
  } catch {
    return await axios.get(`${FALLBACK_API}${endpoint}`)
  }
}

const ListaGerentes: React.FC = () => {
  const [gerentes, setGerentes] = useState<Gerente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalElementos, setTotalElementos] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [loadingPagina, setLoadingPagina] = useState(false)
  const navigate = useNavigate()

  const elementosPorPagina = 6

  useEffect(() => {
    cargarGerentes()
  }, [paginaActual])

  const cargarGerentes = async () => {
    try {
      if (paginaActual === 1) {
        setLoading(true)
      } else {
        setLoadingPagina(true)
      }

      const endpoint = `/get/gerente?page=${paginaActual}&per_page=${elementosPorPagina}`
      console.log(`📄 Cargando página ${paginaActual}: ${endpoint}`)

      const res = await fetchWithFallback(endpoint)
      console.log("📊 Respuesta del API:", res.data)

      const response = res.data as PaginationResponse<Gerente>

      // Extraer datos de diferentes estructuras posibles
      const datos = response.gerentes || response.data || res.data
      const gerentesArray = Array.isArray(datos) ? datos : []

      const formateados = gerentesArray
        .map(
          (g: any): Gerente => ({
            gerente_key: g.gerente_key || g.gerente_id || "",
            gerente_id: g.gerente_id || g.gerente_key || "",
            nombre: g.nombre,
          }),
        )
        .filter((g: Gerente) => g.gerente_key && g.nombre)

      setGerentes(formateados)

      // Extraer metadatos de paginación
      const total = response.total || response.count || formateados.length
      const pages = response.total_pages || response.pages || Math.ceil(total / elementosPorPagina)

      setTotalElementos(total)
      setTotalPaginas(pages)

      console.log(`✅ Cargados ${formateados.length} gerentes. Total: ${total}, Páginas: ${pages}`)
      setError("")
    } catch (err: any) {
      console.error("Error al obtener gerentes:", err)
      setError("Error al cargar los gerentes")
    } finally {
      setLoading(false)
      setLoadingPagina(false)
      // Scroll al inicio al cambiar página
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const irAPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas && !loadingPagina) {
      setPaginaActual(pagina)
    }
  }

  const generarNumerosPagina = () => {
    const numeros = []
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

  if (loading) {
    return (
      <div className="lista-container">
        <h1>Cargando gerentes...</h1>
      </div>
    )
  }

  const inicioElemento = (paginaActual - 1) * elementosPorPagina + 1
  const finElemento = Math.min(paginaActual * elementosPorPagina, totalElementos)

  return (
    <div className="lista-container">
      <div className="lista-header">
        <h1>Listado de Gerentes</h1>
        <button className="btn-volver" onClick={() => navigate("/gerentes")}>
          ← Volver a Gestión
        </button>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {gerentes.length === 0 ? (
        <p className="mensaje-vacio">No hay gerentes registrados.</p>
      ) : (
        <>
          <div style={{ marginBottom: "1rem", color: "#666" }}>
            Total de gerentes: {totalElementos} • Página {paginaActual} de {totalPaginas}
          </div>

          <div className="tarjetas-vendedores" style={{ opacity: loadingPagina ? 0.6 : 1, transition: "opacity 0.3s" }}>
            {gerentes.map((g) => (
              <div
                className="tarjeta"
                key={g.gerente_key}
                onClick={() => navigate(`/gerentes/${g.gerente_key}`)}
                style={{ cursor: "pointer" }}
              >
                <h3>{g.nombre}</h3>
                <p>
                  <strong>ID:</strong> {g.gerente_id}
                </p>
                <p>
                  <strong>UUID:</strong> {g.gerente_key}
                </p>
              </div>
            ))}
          </div>

          {/* Controles de Paginación */}
          {totalPaginas > 1 && (
            <div className="paginacion-container">
              <div className="paginacion-info">
                Mostrando {inicioElemento}-{finElemento} de {totalElementos} gerentes
              </div>

              <div className="paginacion-controles">
                <button
                  onClick={() => irAPagina(paginaActual - 1)}
                  disabled={paginaActual === 1 || loadingPagina}
                  className="paginacion-btn"
                >
                  ← Anterior
                </button>

                {generarNumerosPagina().map((numero) => (
                  <button
                    key={numero}
                    onClick={() => irAPagina(numero)}
                    disabled={loadingPagina}
                    className={`paginacion-btn ${numero === paginaActual ? "activo" : ""}`}
                  >
                    {numero}
                  </button>
                ))}

                <button
                  onClick={() => irAPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas || loadingPagina}
                  className="paginacion-btn"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ListaGerentes
