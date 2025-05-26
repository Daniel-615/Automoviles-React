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
  const navigate = useNavigate()

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)

      const [tiendasRes, ciudadesRes, gerentesRes] = await Promise.all([
        fetchWithFallback("/get/tienda"),
        fetchWithFallback("/get/ciudad"),
        fetchWithFallback("/get/gerente"),
      ])

      setTiendas(tiendasRes.data.tiendas || tiendasRes.data)
      setCiudades(ciudadesRes.data.ciudades || ciudadesRes.data)
      setGerentes(gerentesRes.data.gerentes || gerentesRes.data)
      setError("")
    } catch (err: any) {
      console.error("Error al obtener datos:", err)
      setError("Error al cargar las tiendas")
    } finally {
      setLoading(false)
    }
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
          <div style={{ marginBottom: "1rem", color: "#666" }}>Total de tiendas: {tiendas.length}</div>

          <div className="tarjetas-vendedores">
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
                <p>
                  <strong>Tamaño:</strong> {t.tamaño_m2} m²
                </p>
                <p>
                  <strong>Horario:</strong> {t.horario_apertura} - {t.horario_cierre}
                </p>
                <p>
                  <strong>Gerente:</strong> {obtenerNombreGerente(t.gerente_key)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ListaTiendas
