"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "../../components/css/ListaTiendas.css"

interface Tienda {
  tienda_key?: string
  tienda_id: string
  nombre_tienda: string
  direccion: string
  ciudad: string
  tamaño_m2: number
  horario_apertura: string
  horario_cierre: string
  gerente_key: string
}

interface Ciudad {
  ciudad_key: string
  ciudad_nombre: string
}

interface Gerente {
  gerente_key: string
  nombre: string
}

interface PaginationResponse<T> {
  tiendas?: T[]
  data?: T[]
  total?: number
  total_pages?: number
  current_page?: number
  per_page?: number
}

const PRIMARY_API = "https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas"
const FALLBACK_API = "http://127.0.0.1:5000/ventas"

const fetchWithFallback = async (endpoint: string) => {
  try {
    return await axios.get(`${PRIMARY_API}${endpoint}`)
  } catch {
    return await axios.get(`${FALLBACK_API}${endpoint}`)
  }
}

const ListaTiendas: React.FC = () => {
  const [tiendas, setTiendas] = useState<Tienda[]>([])
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
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
    cargarDatosIniciales()
  }, [])

  useEffect(() => {
    if (ciudades.length > 0 && gerentes.length > 0) {
      cargarTiendas()
    }
  }, [paginaActual, ciudades, gerentes])

  const cargarDatosIniciales = async () => {
    try {
      const [ciudadesRes, gerentesRes] = await Promise.all([
        fetchWithFallback("/get/ciudad"),
        fetchWithFallback("/get/gerente"),
      ])

      setCiudades(ciudadesRes.data.ciudades || ciudadesRes.data)
      setGerentes(gerentesRes.data.gerentes || gerentesRes.data)
    } catch (err: any) {
      console.error("Error al obtener datos iniciales:", err)
    }
  }

  const cargarTiendas = async () => {
    try {
      if (paginaActual === 1) {
        setLoading(true)
      } else {
        setLoadingPagina(true)
      }

      const endpoint = `/get/tienda?page=${paginaActual}&per_page=${elementosPorPagina}`
      console.log(`📄 Cargando página ${paginaActual}: ${endpoint}`)

      const res = await fetchWithFallback(endpoint)
      console.log("📊 Respuesta del API:", res.data)

      const response = res.data as PaginationResponse<Tienda>

      // Extraer datos de diferentes estructuras posibles
      const datos = response.tiendas || response.data || res.data
      const tiendasArray = Array.isArray(datos) ? datos : []

      setTiendas(tiendasArray)

      // Extraer metadatos de paginación
      const total = response.total || tiendasArray.length
      const pages = response.total_pages || Math.ceil(total / elementosPorPagina)

      setTotalElementos(total)
      setTotalPaginas(pages)

      console.log(`✅ Cargadas ${tiendasArray.length} tiendas. Total: ${total}, Páginas: ${pages}`)
      setError("")
    } catch (err: any) {
      console.error("Error al obtener tiendas:", err)
      setError("Error al cargar las tiendas")
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

  const obtenerNombreCiudad = (ciudadKey: string) => {
    const ciudad = ciudades.find((c) => c.ciudad_key === ciudadKey)
    return ciudad ? ciudad.ciudad_nombre : ciudadKey
  }

  const obtenerNombreGerente = (gerenteKey: string) => {
    const gerente = gerentes.find((g) => g.gerente_key === gerenteKey)
    return gerente ? gerente.nombre : gerenteKey
  }

  const editarTienda = (uuid: string) => {
    navigate(`/tiendas?uuid=${uuid}`)
  }

  if (loading) {
    return (
      <div className="lista-container">
        <h1>Cargando tiendas...</h1>
      </div>
    )
  }

  const inicioElemento = (paginaActual - 1) * elementosPorPagina + 1
  const finElemento = Math.min(paginaActual * elementosPorPagina, totalElementos)

  return (
    <div className="lista-container">
      <div className="lista-header">
        <h1>Listado de Tiendas</h1>
        <button className="btn-volver" onClick={() => navigate("/tiendas")}>
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

      {tiendas.length === 0 ? (
        <p className="mensaje-vacio">No hay tiendas registradas.</p>
      ) : (
        <>
          <div style={{ marginBottom: "1rem", color: "#666" }}>
            Total de tiendas: {totalElementos} • Página {paginaActual} de {totalPaginas}
          </div>

          <div className="tarjetas-vendedores" style={{ opacity: loadingPagina ? 0.6 : 1, transition: "opacity 0.3s" }}>
            {tiendas.map((t) => (
              <div
                className="tarjeta"
                key={t.tienda_key}
                onClick={() => editarTienda(t.tienda_key || "")}
                style={{ cursor: "pointer" }}
              >
                <h3>{t.nombre_tienda}</h3>
                <p>
                  <strong>ID:</strong> {t.tienda_id}
                </p>
                <p>
                  <strong>Dirección:</strong> {t.direccion}
                </p>
                <p>
                  <strong>Ciudad:</strong> {obtenerNombreCiudad(t.ciudad)}
                </p>
                <div className="info-tamaño">
                  <strong>Tamaño:</strong> {t.tamaño_m2} m²
                </div>
                <div className="info-horario">
                  <strong>Horario:</strong> {t.horario_apertura} - {t.horario_cierre}
                </div>
                <p>
                  <strong>Gerente:</strong> {obtenerNombreGerente(t.gerente_key)}
                </p>
              </div>
            ))}
          </div>

          {/* Controles de Paginación */}
          {totalPaginas > 1 && (
            <div className="paginacion-container">
              <div className="paginacion-info">
                Mostrando {inicioElemento}-{finElemento} de {totalElementos} tiendas
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

export default ListaTiendas
