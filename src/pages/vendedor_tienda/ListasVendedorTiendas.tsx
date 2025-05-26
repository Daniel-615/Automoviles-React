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
  const navigate = useNavigate()

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)

      const [registrosRes, vendedoresRes, tiendasRes] = await Promise.all([
        fetchWithFallback("/vendedor/tienda/get"),
        fetchWithFallback("/get/vendedor"),
        fetchWithFallback("/get/tienda"),
      ])

      setRegistros(registrosRes.data.vendedor_tienda || registrosRes.data)
      setVendedores(vendedoresRes.data.vendedores || vendedoresRes.data)
      setTiendas(tiendasRes.data.tiendas || tiendasRes.data)
      setError("")
    } catch (err: any) {
      console.error("Error al obtener datos:", err)
      setError("Error al cargar los registros")
    } finally {
      setLoading(false)
    }
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
          <div style={{ marginBottom: "1rem", color: "#666" }}>Total de relaciones: {registros.length}</div>

          <div className="tarjetas-vendedores">
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
        </>
      )}
    </div>
  )
}

export default ListaVendedorTienda
