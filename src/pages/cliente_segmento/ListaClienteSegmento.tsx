"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "../../components/css/cliente_segmento.css"

const PRIMARY_API = "https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas"
const FALLBACK_API = "http://localhost:5000/ventas"

interface ClienteSegmento {
  cliente_segmento_key?: string
  cliente_key: string
  segmento_key: string
}

interface Cliente {
  cliente_key: string
  nombre: string
  apellido: string
}

interface Segmento {
  segmento_key: string
  nombre: string
}

interface PaginationResponse {
  data?: any[]
  clientes_segmento?: any[]
  total?: number
  page?: number
  per_page?: number
  total_pages?: number
  has_next?: boolean
  has_prev?: boolean
}

const fetchWithFallback = async (endpoint: string) => {
  try {
    console.log(`🔍 Intentando PRIMARY_API: ${PRIMARY_API}${endpoint}`)
    const response = await axios.get(`${PRIMARY_API}${endpoint}`)
    console.log(`✅ PRIMARY_API exitoso:`, response.data)
    return response
  } catch (error) {
    console.log(`❌ PRIMARY_API falló, intentando FALLBACK_API: ${FALLBACK_API}${endpoint}`)
    const response = await axios.get(`${FALLBACK_API}${endpoint}`)
    console.log(`✅ FALLBACK_API exitoso:`, response.data)
    return response
  }
}

const ListaClienteSegmento: React.FC = () => {
  const [relaciones, setRelaciones] = useState<ClienteSegmento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [segmentos, setSegmentos] = useState<Segmento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalElementos, setTotalElementos] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [elementosPorPagina] = useState(6)
  const [_apiInfo, setApiInfo] = useState<string>("")
  const navigate = useNavigate()

  useEffect(() => {
    cargarDatosIniciales()
  }, [])

  useEffect(() => {
    cargarRelaciones()
  }, [paginaActual])

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true)
      console.log("🚀 Cargando datos iniciales (clientes y segmentos)...")

      const [clientesRes, segmentosRes] = await Promise.all([
        fetchWithFallback("/get/cliente"),
        fetchWithFallback("/get/segmento"),
      ])

      // Extraer datos de clientes y segmentos
      const clientesData =
        clientesRes.data.clientes || clientesRes.data.cliente || clientesRes.data.data || clientesRes.data

      const segmentosData =
        segmentosRes.data.segmentos || segmentosRes.data.segmento || segmentosRes.data.data || segmentosRes.data

      console.log("👥 Clientes cargados:", Array.isArray(clientesData) ? clientesData.length : "No es array")
      console.log("🏷️ Segmentos cargados:", Array.isArray(segmentosData) ? segmentosData.length : "No es array")

      setClientes(Array.isArray(clientesData) ? clientesData : [])
      setSegmentos(Array.isArray(segmentosData) ? segmentosData : [])

      // Cargar primera página de relaciones
      await cargarRelaciones()
    } catch (err: any) {
      console.error("💥 Error al cargar datos iniciales:", err)
      setError(`Error al cargar los datos iniciales: ${err.message}`)
      setLoading(false)
    }
  }

  const cargarRelaciones = async () => {
    try {
      setLoading(true)
      const endpoint = `/get/cliente_segmento?page=${paginaActual}&per_page=${elementosPorPagina}`
      console.log(`📄Cargando página ${paginaActual} con endpoint: ${endpoint}`)

      const relacionesRes = await fetchWithFallback(endpoint)
      const responseData: PaginationResponse = relacionesRes.data

      console.log(" Respuesta completa de relaciones paginadas:", responseData)

      // Extraer datos de la respuesta paginada
      const relacionesData =
        responseData.clientes_segmento ||
        responseData.data ||
        (Array.isArray(relacionesRes.data) ? relacionesRes.data : [])

      // Extraer información de paginación
      const total = responseData.total || relacionesData.length || 0
      const totalPages = responseData.total_pages || Math.ceil(total / elementosPorPagina)

      setRelaciones(Array.isArray(relacionesData) ? relacionesData : [])
      setTotalElementos(total)
      setTotalPaginas(totalPages)

      // Info del API usado
      const apiUsed = relacionesRes.config?.url?.includes("localhost") ? "FALLBACK (localhost)" : "PRIMARY (Azure)"
      setApiInfo(`API usado: ${apiUsed} | Página: ${paginaActual}/${totalPages}`)
    } catch (err: any) {
      console.error("💥 Error al cargar relaciones:", err)
      console.error("💥 Error response:", err.response?.data)
      setError(`Error al cargar las relaciones: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const obtenerNombreCliente = (clienteKey: string) => {
    const cliente = clientes.find((c) => c.cliente_key === clienteKey)
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : clienteKey
  }

  const obtenerNombreSegmento = (segmentoKey: string) => {
    const segmento = segmentos.find((s) => s.segmento_key === segmentoKey)
    return segmento ? segmento.nombre : segmentoKey
  }

  const irAPagina = (pagina: number) => {
    if (pagina !== paginaActual && pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina)
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

  if (loading && relaciones.length === 0) {
    return (
      <div className="lista-container">
        <h1>Cargando relaciones...</h1>
        <p>🔄 Conectando con el servidor...</p>
      </div>
    )
  }

  return (
    <div className="lista-container">
      <div className="lista-header">
        <h1>Listado Cliente - Segmento</h1>
        <button className="btn-volver" onClick={() => navigate("/cliente-segmento")}>
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

      {relaciones.length === 0 && !loading ? (
        <p className="mensaje-vacio">No hay relaciones registradas en esta página.</p>
      ) : (
        <>
          <div style={{ marginBottom: "1rem", color: "#666" }}>
            Total de relaciones: {totalElementos} • Página {paginaActual} de {totalPaginas}
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: "1rem", color: "#666" }}>
              🔄 Cargando página {paginaActual}...
            </div>
          )}

          <div className="tarjetas-vendedores">
            {relaciones.map((r) => (
              <div
                className="tarjeta"
                key={r.cliente_segmento_key}
                onClick={() => navigate(`/cliente-segmento/${r.cliente_segmento_key}`)}
                style={{ cursor: "pointer", opacity: loading ? 0.7 : 1 }}
              >
                <h3>Relación Cliente-Segmento</h3>
                <p>
                  <strong>Cliente:</strong> {obtenerNombreCliente(r.cliente_key)}
                </p>
                <p>
                  <strong>Segmento:</strong> {obtenerNombreSegmento(r.segmento_key)}
                </p>
                <p>
                  <strong>ID:</strong> {r.cliente_segmento_key}
                </p>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="paginacion-container">
              <div className="paginacion-info">
                Mostrando página {paginaActual} de {totalPaginas} ({totalElementos} elementos totales)
              </div>

              <div className="paginacion-controles">
                <button className="btn-paginacion" onClick={paginaAnterior} disabled={paginaActual === 1 || loading}>
                  ← Anterior
                </button>

                <div className="numeros-pagina">
                  {generarNumerosPagina().map((numero) => (
                    <button
                      key={numero}
                      className={`btn-numero ${numero === paginaActual ? "activo" : ""}`}
                      onClick={() => irAPagina(numero)}
                      disabled={loading}
                    >
                      {numero}
                    </button>
                  ))}
                </div>

                <button
                  className="btn-paginacion"
                  onClick={paginaSiguiente}
                  disabled={paginaActual === totalPaginas || loading}
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

export default ListaClienteSegmento
