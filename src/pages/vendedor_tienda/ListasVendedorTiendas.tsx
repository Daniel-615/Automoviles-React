"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "../../components/css/ListaVendedorTiendas.css"

interface VendedorTienda {
  id?: string
  vendedor_key: string
  tienda_key: string
  fecha_renuncia?: string
  activo?: boolean
}

interface Vendedor {
  vendedor_key: string
  nombre: string
}

interface Tienda {
  tienda_key: string
  nombre_tienda: string
}

interface PaginationResponse<T> {
  vendedor_tienda?: T[]
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
const FALLBACK_API = "http://127.0.0.1:5000/ventas"

const fetchWithFallback = async (endpoint: string) => {
  try {
    return await axios.get(`${PRIMARY_API}${endpoint}`)
  } catch {
    return await axios.get(`${FALLBACK_API}${endpoint}`)
  }
}

const ListaVendedorTienda: React.FC = () => {
  const [registros, setRegistros] = useState<VendedorTienda[]>([])
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [tiendas, setTiendas] = useState<Tienda[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalElementos, setTotalElementos] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [loadingPagina, setLoadingPagina] = useState(false)
  const navigate = useNavigate()

  const elementosPorPagina = 10

  useEffect(() => {
    cargarDatosReferencia()
  }, [])

  useEffect(() => {
    if (vendedores.length > 0 && tiendas.length > 0) {
      cargarRegistros()
    }
  }, [paginaActual, vendedores, tiendas])

  const cargarDatosReferencia = async () => {
    try {
      const [vendedoresRes, tiendasRes] = await Promise.all([
        fetchWithFallback("/get/vendedor"),
        fetchWithFallback("/get/tienda"),
      ])

      setVendedores(vendedoresRes.data.vendedores || vendedoresRes.data)
      setTiendas(tiendasRes.data.tiendas || tiendasRes.data)
    } catch (err: any) {
      console.error("Error al obtener datos de referencia:", err)
    }
  }

  const cargarRegistros = async () => {
    try {
      if (paginaActual === 1) {
        setLoading(true)
      } else {
        setLoadingPagina(true)
      }

      const endpoint = `/vendedor/tienda/get?page=${paginaActual}&per_page=${elementosPorPagina}`
      console.log(`📄 Cargando página ${paginaActual}: ${endpoint}`)

      const res = await fetchWithFallback(endpoint)
      console.log("📊 Respuesta del API:", res.data)

      const response = res.data as PaginationResponse<VendedorTienda>

      // Extraer datos de diferentes estructuras posibles
      const datos = response.vendedor_tienda || response.data || res.data
      const registrosArray = Array.isArray(datos) ? datos : []

      const formateados = registrosArray
        .map((r: any) => ({
          id: r.id || r.vendedor_tienda_id,
          vendedor_key: r.vendedor_key,
          tienda_key: r.tienda_key,
          fecha_renuncia: r.fecha_renuncia,
          activo: r.activo !== undefined ? r.activo : true,
        }))
        .filter((r: VendedorTienda) => r.vendedor_key && r.tienda_key)

      setRegistros(formateados)

      // Extraer metadatos de paginación
      const total = response.total || response.count || formateados.length
      const pages = response.total_pages || response.pages || Math.ceil(total / elementosPorPagina)

      setTotalElementos(total)
      setTotalPaginas(pages)

      console.log(`✅ Cargados ${formateados.length} registros. Total: ${total}, Páginas: ${pages}`)
      setError("")
    } catch (err: any) {
      console.error("Error al obtener registros:", err)
      setError("Error al cargar los registros")
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

  const obtenerNombreVendedor = (vendedorKey: string) => {
    const vendedor = vendedores.find((v) => v.vendedor_key === vendedorKey)
    return vendedor ? vendedor.nombre : vendedorKey
  }

  const obtenerNombreTienda = (tiendaKey: string) => {
    const tienda = tiendas.find((t) => t.tienda_key === tiendaKey)
    return tienda ? tienda.nombre_tienda : tiendaKey
  }

  if (loading) {
    return (
      <div className="lista-container">
        <h1>Cargando relaciones...</h1>
      </div>
    )
  }

  const inicioElemento = (paginaActual - 1) * elementosPorPagina + 1
  const finElemento = Math.min(paginaActual * elementosPorPagina, totalElementos)

  return (
    <div className="lista-container">
      <div className="lista-header">
        <h1>Relaciones Vendedor - Tienda</h1>
        <button className="btn-volver" onClick={() => navigate("/vendedor_tienda")}>
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

      {registros.length === 0 ? (
        <p className="mensaje-vacio">No hay registros disponibles.</p>
      ) : (
        <>
          <div style={{ marginBottom: "1rem", color: "#666" }}>
            Total de relaciones: {totalElementos} • Página {paginaActual} de {totalPaginas}
          </div>

          <div className="tarjetas-vendedores" style={{ opacity: loadingPagina ? 0.6 : 1, transition: "opacity 0.3s" }}>
            {registros.map((r) => (
              <div
                className="tarjeta"
                key={r.id}
                onClick={() => navigate(`/vendedor-tienda/${r.id}`)}
                style={{ cursor: "pointer" }}
              >
                <h3>Relación Vendedor-Tienda</h3>
                <p>
                  <strong>Vendedor:</strong> {obtenerNombreVendedor(r.vendedor_key)}
                </p>
                <p>
                  <strong>Tienda:</strong> {obtenerNombreTienda(r.tienda_key)}
                </p>
                <p>
                  <strong>Estado:</strong> {r.activo ? "Activo" : "Inactivo"}
                </p>
                <p>
                  <strong>Fecha Renuncia:</strong> {r.fecha_renuncia || "N/A"}
                </p>
                <p>
                  <strong>ID:</strong> {r.id}
                </p>
              </div>
            ))}
          </div>

          {/* Controles de Paginación */}
          {totalPaginas > 1 && (
            <div className="paginacion-container">
              <div className="paginacion-info">
                Mostrando {inicioElemento}-{finElemento} de {totalElementos} relaciones
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

export default ListaVendedorTienda
