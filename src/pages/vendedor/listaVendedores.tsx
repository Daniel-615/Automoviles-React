"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import type { Vendedor } from "./Vendedor"
import { useNavigate } from "react-router-dom"
import "../../components/css/ListaVendedores.css"

const PRIMARY_API = "https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas"
const FALLBACK_API = "http://127.0.0.1:5000/ventas"

interface PaginationResponse<T> {
  vendedores?: T[]
  data?: T[]
  total?: number
  total_pages?: number
  current_page?: number
  per_page?: number
  page?: number
  count?: number
}

const axiosWithFallback = async (method: "get" | "post" | "put", path: string, data?: any) => {
  try {
    return await axios({ method, url: `${PRIMARY_API}${path}`, data })
  } catch (error) {
    console.warn("Fallo la ruta principal. Usando fallback...")
    return await axios({ method, url: `${FALLBACK_API}${path}`, data })
  }
}

const ListaVendedores: React.FC = () => {
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalElementos, setTotalElementos] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const elementosPorPagina = 6
  const navigate = useNavigate()

  useEffect(() => {
    cargarVendedores()
  }, [paginaActual])

  const cargarVendedores = async () => {
    try {
      setLoading(true)
      const endpoint = `/get/vendedor?page=${paginaActual}&per_page=${elementosPorPagina}`
      console.log(`📄 Cargando página ${paginaActual}: ${endpoint}`)

      const res = await axiosWithFallback("get", endpoint)
      console.log("📊 Respuesta del API:", res.data)

      const response: PaginationResponse<Vendedor> = res.data

      // Extraer vendedores de diferentes posibles estructuras
      let vendedoresData: Vendedor[] = []
      if (response.vendedores) {
        vendedoresData = response.vendedores
      } else if (response.data) {
        vendedoresData = response.data
      } else if (Array.isArray(res.data)) {
        vendedoresData = res.data
      }

      // Filtrar vendedores válidos
      const formateados = vendedoresData.filter((v: Vendedor) => v.vendedor_key && v.nombre)
      setVendedores(formateados)

      // Extraer metadatos de paginación
      const total = response.total || response.count || formateados.length
      const totalPages = response.total_pages || Math.ceil(total / elementosPorPagina)

      setTotalElementos(total)
      setTotalPaginas(totalPages)

      console.log(`✅ Cargados ${formateados.length} vendedores. Total: ${total}, Páginas: ${totalPages}`)
      setError("")
    } catch (err: any) {
      console.error("Error al obtener vendedores:", err)
      setError("Error al cargar los vendedores")
    } finally {
      setLoading(false)
    }
  }

  const editarVendedor = (id: string) => {
    navigate(`/vendedor/${id}`)
  }

  const irAPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas && pagina !== paginaActual) {
      setPaginaActual(pagina)
      // Scroll suave hacia arriba
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      irAPagina(paginaActual - 1)
    }
  }

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      irAPagina(paginaActual + 1)
    }
  }

  // Generar números de página para mostrar
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

  if (loading && paginaActual === 1) {
    return (
      <div className="vendedores-page">
        <h2>Cargando vendedores...</h2>
      </div>
    )
  }

  return (
    <div className="vendedores-page">
      <div className="vendedores-header">
        <h2>Listado de Vendedores</h2>
        <button className="volver-btn" onClick={() => navigate("/vendedor")}>
          ⬅ Volver a Gestión
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

      {vendedores.length === 0 && !loading ? (
        <p className="mensaje-vacio" style={{ color: "#666", textAlign: "center" }}>
          No hay vendedores registrados.
        </p>
      ) : (
        <>
          <div
            style={{
              marginBottom: "1rem",
              color: "#666",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span>
              Total de vendedores: {totalElementos} • Página {paginaActual} de {totalPaginas}
            </span>
            <span style={{ fontSize: "0.9em", opacity: 0.8 }}>
              Mostrando {(paginaActual - 1) * elementosPorPagina + 1}-
              {Math.min(paginaActual * elementosPorPagina, totalElementos)} de {totalElementos} vendedores
            </span>
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: "1rem", color: "#666" }}>Cargando página {paginaActual}...</div>
          )}

          <ul className="vendedores-lista">
            {vendedores.map((v) => (
              <li
                key={v.vendedor_key}
                className="vendedor-card"
                onClick={() => editarVendedor(v.vendedor_key || "")}
                style={{ cursor: "pointer", opacity: loading ? 0.6 : 1 }}
              >
                <p>
                  <strong>Nombre:</strong> {v.nombre}
                </p>
                <p>
                  <strong>ID:</strong> {v.vendedor_id}
                </p>
                <p>
                  <strong>Edad:</strong> {v.edad} años
                </p>
                <p>
                  <strong>Salario:</strong> Q{v.salario?.toLocaleString()}
                </p>
                <p>
                  <strong>Activo:</strong> {v.activo ? "Sí" : "No"}
                </p>
                <p>
                  <strong>UUID:</strong> {v.vendedor_key}
                </p>
              </li>
            ))}
          </ul>

          {/* Controles de Paginación */}
          {totalPaginas > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem",
                marginTop: "2rem",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={paginaAnterior}
                disabled={paginaActual === 1 || loading}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: paginaActual === 1 || loading ? "#e0e0e0" : "#1565c0",
                  color: paginaActual === 1 || loading ? "#999" : "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: paginaActual === 1 || loading ? "not-allowed" : "pointer",
                  fontSize: "0.9rem",
                }}
              >
                ← Anterior
              </button>

              {generarNumerosPagina().map((numero) => (
                <button
                  key={numero}
                  onClick={() => irAPagina(numero)}
                  disabled={loading}
                  style={{
                    padding: "0.5rem 0.75rem",
                    backgroundColor: numero === paginaActual ? "#1565c0" : loading ? "#e0e0e0" : "#f5f5f5",
                    color: numero === paginaActual ? "white" : loading ? "#999" : "#333",
                    border: numero === paginaActual ? "2px solid #1565c0" : "1px solid #ddd",
                    borderRadius: "6px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "0.9rem",
                    fontWeight: numero === paginaActual ? "bold" : "normal",
                  }}
                >
                  {numero}
                </button>
              ))}

              <button
                onClick={paginaSiguiente}
                disabled={paginaActual === totalPaginas || loading}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: paginaActual === totalPaginas || loading ? "#e0e0e0" : "#1565c0",
                  color: paginaActual === totalPaginas || loading ? "#999" : "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: paginaActual === totalPaginas || loading ? "not-allowed" : "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Siguiente →
              </button>
            </div>
          )}

          {/* Información adicional de paginación */}
          {totalPaginas > 1 && (
            <div
              style={{
                textAlign: "center",
                marginTop: "1rem",
                fontSize: "0.85rem",
                color: "#666",
              }}
            >
              Página {paginaActual} de {totalPaginas}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ListaVendedores
