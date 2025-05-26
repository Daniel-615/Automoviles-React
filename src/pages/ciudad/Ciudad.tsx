"use client"

import type React from "react"
import { useState, type ChangeEvent, useEffect } from "react"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import "../../components/css/Ciudades.css"

const PRIMARY_API = "https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas"
const FALLBACK_API = "http://127.0.0.1:5000/ventas"

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

const Ciudades: React.FC = () => {
  const [nuevaCiudad, setNuevaCiudad] = useState({
    ciudad_nombre: "",
    region_key: "",
  })
  const [regiones, setRegiones] = useState<Region[]>([])
  const [editando, setEditando] = useState<boolean>(false)
  const [ciudadEditando, setCiudadEditando] = useState<Ciudad | null>(null)
  const [busquedaId, setBusquedaId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const apiRequest = async (method: "get" | "post" | "put", endpoint: string, body?: any) => {
    try {
      return await axios({ method, url: `${PRIMARY_API}${endpoint}`, data: body })
    } catch {
      return await axios({ method, url: `${FALLBACK_API}${endpoint}`, data: body })
    }
  }

  useEffect(() => {
    cargarRegiones()
  }, [])

  useEffect(() => {
    if (id) {
      cargarCiudadParaEdicion(id)
    }
  }, [id])

  const cargarRegiones = async () => {
    try {
      const res = await apiRequest("get", "/get/region")
      const lista = res.data.regiones || res.data
      setRegiones(lista)
    } catch (err) {
      console.error("Error al cargar regiones:", err)
      setError("Error al cargar las regiones")
    }
  }

  const cargarCiudadParaEdicion = async (ciudadId: string) => {
    try {
      setLoading(true)
      const res = await apiRequest("get", `/get/ciudad/${ciudadId}`)
      const c = res.data
      setNuevaCiudad({
        ciudad_nombre: c.ciudad_nombre || "",
        region_key: c.region_key || "",
      })
      setCiudadEditando(c)
      setEditando(true)
    } catch (err: any) {
      console.error("Error al obtener ciudad:", err)
      setError(err.response?.data?.message || "Error al cargar la ciudad")
    } finally {
      setLoading(false)
    }
  }

  const manejarCambio = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNuevaCiudad((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const validarFormulario = () => {
    if (!nuevaCiudad.ciudad_nombre.trim()) {
      setError("El nombre de la ciudad es requerido")
      return false
    }
    if (!editando && !nuevaCiudad.region_key) {
      setError("Debe seleccionar una región")
      return false
    }
    return true
  }

  const crearCiudad = async () => {
    if (!validarFormulario()) return

    try {
      setLoading(true)
      await apiRequest("post", "/post/ciudad", nuevaCiudad)
      setNuevaCiudad({ ciudad_nombre: "", region_key: "" })
      setError("")
      alert("Ciudad creada exitosamente")
    } catch (err: any) {
      console.error("Error al crear ciudad:", err)
      setError(err.response?.data?.message || "Error al crear la ciudad")
    } finally {
      setLoading(false)
    }
  }

  const actualizarCiudad = async () => {
    if (!ciudadEditando?.ciudad_key) return
    if (!nuevaCiudad.ciudad_nombre.trim()) {
      setError("El nombre de la ciudad es requerido")
      return
    }

    try {
      setLoading(true)
      await apiRequest("put", `/put/ciudad/${ciudadEditando.ciudad_key}`, {
        ciudad_nombre: nuevaCiudad.ciudad_nombre,
      })
      alert("Ciudad actualizada exitosamente")
      cancelarEdicion()
    } catch (err: any) {
      console.error("Error al actualizar ciudad:", err)
      setError(err.response?.data?.message || "Error al actualizar la ciudad")
    } finally {
      setLoading(false)
    }
  }

  const obtenerCiudadPorId = async () => {
    if (!busquedaId.trim()) {
      setError("Ingrese un ID para buscar")
      return
    }

    try {
      setLoading(true)
      await cargarCiudadParaEdicion(busquedaId)
      setBusquedaId("")
    } catch (err) {
      // El error ya se maneja en cargarCiudadParaEdicion
    }
  }

  const cancelarEdicion = () => {
    setEditando(false)
    setCiudadEditando(null)
    setNuevaCiudad({ ciudad_nombre: "", region_key: "" })
    setError("")
    navigate("/lista-ciudades")
  }

  if (loading && !editando) {
    return (
      <div className="ciudad-container">
        <h2>Cargando...</h2>
      </div>
    )
  }

  return (
    <div className="ciudad-container">
      <h2>Gestión de Ciudades</h2>

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
          placeholder="Buscar ciudad por ID"
          value={busquedaId}
          onChange={(e) => setBusquedaId(e.target.value)}
        />
        <button onClick={obtenerCiudadPorId} disabled={loading}>
          Buscar
        </button>
      </div>

      <div className="formulario">
        <input
          name="ciudad_nombre"
          placeholder="Nombre de la Ciudad"
          value={nuevaCiudad.ciudad_nombre}
          onChange={manejarCambio}
          disabled={loading}
        />

        {!editando && (
          <select name="region_key" value={nuevaCiudad.region_key} onChange={manejarCambio} disabled={loading}>
            <option value="">-- Selecciona una región --</option>
            {regiones.map((region) => (
              <option key={region.region_key} value={region.region_key}>
                {region.region_nombre}
              </option>
            ))}
          </select>
        )}

        {editando ? (
          <>
            <button onClick={actualizarCiudad} disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
            <button onClick={cancelarEdicion} className="btn-cancelar" disabled={loading}>
              Cancelar
            </button>
          </>
        ) : (
          <button onClick={crearCiudad} disabled={loading}>
            {loading ? "Creando..." : "Crear"}
          </button>
        )}
      </div>

      <div className="mostrar-listado">
        <button onClick={() => navigate("/lista-ciudades")}>Ir al listado de ciudades</button>
      </div>
    </div>
  )
}

export default Ciudades
