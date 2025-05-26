"use client"

import type React from "react"
import { useEffect, useState, type ChangeEvent } from "react"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import "../../components/css/region.css"

const PRIMARY_API = "https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas"
const FALLBACK_API = "http://localhost:5000/ventas"

interface Region {
  region_key?: string
  region_nombre: string
}

const Region: React.FC = () => {
  const [nuevaRegion, setNuevaRegion] = useState<Region>({ region_nombre: "" })
  const [editando, setEditando] = useState<string | null>(null)
  const [busquedaId, setBusquedaId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { id } = useParams()
  const navigate = useNavigate()

  const apiRequest = async (method: "get" | "post" | "put", endpoint: string, body?: any) => {
    try {
      return await axios({ method, url: `${PRIMARY_API}${endpoint}`, data: body })
    } catch {
      return await axios({ method, url: `${FALLBACK_API}${endpoint}`, data: body })
    }
  }

  useEffect(() => {
    if (id) {
      cargarRegionParaEdicion(id)
    }
  }, [id])

  const cargarRegionParaEdicion = async (regionId: string) => {
    try {
      setLoading(true)
      const res = await apiRequest("get", `/get/region/${regionId}`)
      const r = res.data
      setNuevaRegion({ region_nombre: r.region_nombre || r.nombre })
      setEditando(regionId)
    } catch (err: any) {
      console.error("Región no encontrada:", err)
      setError(err.response?.data?.message || "Error al cargar la región")
    } finally {
      setLoading(false)
    }
  }

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    setNuevaRegion({ ...nuevaRegion, [e.target.name]: e.target.value })
    setError("")
  }

  const validarFormulario = () => {
    if (!nuevaRegion.region_nombre.trim()) {
      setError("El nombre de la región es requerido")
      return false
    }
    return true
  }

  const crearRegion = async () => {
    if (!validarFormulario()) return

    try {
      setLoading(true)
      await apiRequest("post", "/post/region", { region_nombre: nuevaRegion.region_nombre })
      setNuevaRegion({ region_nombre: "" })
      setEditando(null)
      setError("")
      alert("Región creada exitosamente")
    } catch (err: any) {
      console.error("Error al crear la región:", err)
      setError(err.response?.data?.message || "Error al crear la región")
    } finally {
      setLoading(false)
    }
  }

  const actualizarRegion = async () => {
    if (!editando) return
    if (!validarFormulario()) return

    try {
      setLoading(true)
      await apiRequest("put", `/put/region/${editando}`, { region_nombre: nuevaRegion.region_nombre })
      alert("Región actualizada exitosamente")
      cancelarEdicion()
    } catch (err: any) {
      console.error("Error al actualizar la región:", err)
      setError(err.response?.data?.message || "Error al actualizar la región")
    } finally {
      setLoading(false)
    }
  }

  const buscarRegionPorId = async () => {
    if (!busquedaId.trim()) {
      setError("Ingrese un ID para buscar")
      return
    }

    try {
      setLoading(true)
      await cargarRegionParaEdicion(busquedaId)
      setBusquedaId("")
    } catch (err) {
      // El error ya se maneja en cargarRegionParaEdicion
    }
  }

  const cancelarEdicion = () => {
    setEditando(null)
    setNuevaRegion({ region_nombre: "" })
    setBusquedaId("")
    setError("")
    navigate("/lista-regiones")
  }

  if (loading) {
    return (
      <div className="region-container">
        <h2>Cargando...</h2>
      </div>
    )
  }

  return (
    <div className="region-container">
      <h2>Gestión de Regiones</h2>

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

      <div className="form-busqueda">
        <input
          type="text"
          placeholder="Buscar región por ID"
          value={busquedaId}
          onChange={(e) => setBusquedaId(e.target.value)}
        />
        <button onClick={buscarRegionPorId} disabled={loading}>
          Buscar
        </button>
      </div>

      <div className="formulario">
        <input
          type="text"
          name="region_nombre"
          placeholder="Nombre de la Región"
          value={nuevaRegion.region_nombre}
          onChange={manejarCambio}
          disabled={loading}
        />
        {editando ? (
          <>
            <button onClick={actualizarRegion} disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
            <button onClick={cancelarEdicion} className="btn-cancelar" disabled={loading}>
              Cancelar
            </button>
          </>
        ) : (
          <button onClick={crearRegion} disabled={loading}>
            {loading ? "Creando..." : "Crear"}
          </button>
        )}
      </div>

      <div className="mostrar-listado">
        <button onClick={() => navigate("/lista-regiones")}>Ir al listado de regiones</button>
      </div>
    </div>
  )
}

export default Region
