"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "../../components/css/Ciudades.css"

interface Ciudad {
  ciudad_key: string
  ciudad_id: string
  ciudad_nombre: string
  region_key?: string
}

interface Region {
  region_key: string
  region_nombre: string
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

const ListaCiudades: React.FC = () => {
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [regiones, setRegiones] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)

      const [ciudadesRes, regionesRes] = await Promise.all([
        fetchWithFallback("/get/ciudad"),
        fetchWithFallback("/get/region"),
      ])

      const ciudadesData = ciudadesRes.data.ciudades || ciudadesRes.data
      const formateadas = ciudadesData
        .map((c: any) => ({
          ciudad_key: c.ciudad_key || c.ciudad_id,
          ciudad_id: c.ciudad_id || c.ciudad_key,
          ciudad_nombre: c.ciudad_nombre || c.nombre,
          region_key: c.region_key || "",
        }))
        .filter((c: Ciudad) => c.ciudad_key && c.ciudad_nombre)

      setCiudades(formateadas)
      setRegiones(regionesRes.data.regiones || regionesRes.data)
    } catch (err: any) {
      console.error("Error al obtener datos:", err)
      setError("Error al cargar las ciudades")
    } finally {
      setLoading(false)
    }
  }

  const obtenerNombreRegion = (regionKey: string) => {
    const region = regiones.find((r) => r.region_key === regionKey)
    return region ? region.region_nombre : "N/A"
  }

  if (loading) {
    return (
      <div className="lista-container">
        <h1>Cargando ciudades...</h1>
      </div>
    )
  }

  return (
    <div className="lista-container">
      <div className="lista-header">
        <h1>Listado de Ciudades</h1>
        <button className="btn-volver" onClick={() => navigate("/ciudades")}>
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

      {ciudades.length === 0 ? (
        <p className="mensaje-vacio">No hay ciudades registradas.</p>
      ) : (
        <>
          <div style={{ marginBottom: "1rem", color: "#666" }}>Total de ciudades: {ciudades.length}</div>

          <div className="tarjetas-vendedores">
            {ciudades.map((c) => (
              <div
                className="tarjeta"
                key={c.ciudad_key}
                onClick={() => navigate(`/ciudades/${c.ciudad_key}`)}
                style={{ cursor: "pointer" }}
              >
                <h3>{c.ciudad_nombre}</h3>
                <p>
                  <strong>ID:</strong> {c.ciudad_id}
                </p>
                <p>
                  <strong>Región:</strong> {obtenerNombreRegion(c.region_key || "")}
                </p>
                <p>
                  <strong>UUID:</strong> {c.ciudad_key}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ListaCiudades
