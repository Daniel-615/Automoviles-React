"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "../../components/css/lista_segmento.css"

interface Segmento {
  segmento_key: string
  segmento_id: string
  nombre: string
}

interface PaginationResponse<T> {
  segmentos?: T[]
  data?: T[]
  total?: number
  total_paginas?: number
  pagina_actual?: number
  per_page?: number
  count?: number
  pages?: number
  page?: number
}

const PRIMARY_URL = "https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas"
const FALLBACK_URL = "http://127.0.0.1:5000/ventas"

const apiRequest = async (method: "get", endpoint: string, params?: any) => {
  try {
    return await axios({ method, url: `${PRIMARY_URL}${endpoint}`, params })
  } catch {
    return await axios({ method, url: `${FALLBACK_URL}${endpoint}`, params })
  }
}

const ListaSegmentos: React.FC = () => {
  const [segmentos, setSegmentos] = useState<Segmento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalElementos, setTotalElementos] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [loadingPagina, setLoadingPagina] = useState(false)
  const navigate = useNavigate()

  const elementosPorPagina = 12

  useEffect(() => {
    cargarSegmentos()
  }, [paginaActual])

  const cargarSegmentos = async () => {
    try {
      if (paginaActual === 1) {
        setLoading(true)
      } else {
        setLoadingPagina(true)
      }

      const endpoint = `/get/segmento?page=${paginaActual}&per_page=${elementosPorPagina}`
      console.log(`📄 Cargando página ${paginaActual}: ${endpoint}`)

      const res = await apiRequest("get", "/get/segmento", {
        page: paginaActual,
        per_page: elementosPorPagina,
      })

      console.log("📊 Respuesta del API:", res.data)

      const response = res.data as PaginationResponse<Segmento>

      // Extraer datos de diferentes estructuras posibles
      const datos = response.segmentos || response.data || res.data
      const segmentosArray = Array.isArray(datos) ? datos : []

      const formateados = segmentosArray
        .map((s: any) => ({
          segmento_key: s.segmento_key,
          segmento_id: s.segmento_id,
          nombre: s.nombre,
        }))
        .filter((s: Segmento) => s.segmento_key && s.nombre)

      setSegmentos(formateados)

      // Extraer metadatos de paginación
      const total = response.total || response.count || formateados.length
      const pages = response.total_paginas || response.pages || Math.ceil(total / elementosPorPagina)

      setTotalElementos(total)
      setTotalPaginas(pages)

      console.log(`✅ Cargados ${formateados.length} segmentos. Total: ${total}, Páginas: ${pages}`)
      setError("")
    } catch (err: any) {
      console.error("Error al obtener segmentos:", err)
      setError(err.response?.data?.message || "Error al cargar los segmentos")
      setSegmentos([])
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
        <h1>Cargando segmentos...</h1>
      </div>
    )
  }

  const inicioElemento = (paginaActual - 1) * elementosPorPagina + 1
  const finElemento = Math.min(paginaActual * elementosPorPagina, totalElementos)

  return (
    <div className="lista-container">
      <div className="lista-header">
        <h1>Listado de Segmentos</h1>
        <button className="btn-volver" onClick={() => navigate("/segmentos")}>
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

      {segmentos.length === 0 ? (
        <p className="mensaje-vacio">No hay segmentos registrados.</p>
      ) : (
        <>
          <div style={{ marginBottom: "1rem", color: "#666" }}>
            Total de segmentos: {totalElementos} • Página {paginaActual} de {totalPaginas}
          </div>

          <div className="tarjetas-vendedores" style={{ opacity: loadingPagina ? 0.6 : 1, transition: "opacity 0.3s" }}>
            {segmentos.map((s) => (
              <div
                className="tarjeta"
                key={s.segmento_key}
                onClick={() => navigate(`/segmentos/${s.segmento_key}`)}
                style={{ cursor: "pointer" }}
              >
                <h3>{s.nombre}</h3>
                <p>
                  <strong>ID:</strong> {s.segmento_id}
                </p>
                <p>
                  <strong>UUID:</strong> {s.segmento_key}
                </p>
              </div>
            ))}
          </div>

          {/* Controles de Paginación */}
          {totalPaginas > 1 && (
            <div className="paginacion-container">
              <div className="paginacion-info">
                Mostrando {inicioElemento}-{finElemento} de {totalElementos} segmentos
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

export default ListaSegmentos
