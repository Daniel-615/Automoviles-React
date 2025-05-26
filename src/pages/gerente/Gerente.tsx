"use client"

import type React from "react"
import { useEffect, useState, type ChangeEvent } from "react"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import "../../components/css/Gerente.css"

const PRIMARY_API = "https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas"
const FALLBACK_API = "http://localhost:5000/ventas"

interface Gerente {
  gerente_key: string
  gerente_id: string
  nombre: string
}

const Gerentes: React.FC = () => {
  const [nuevoGerente, setNuevoGerente] = useState({
    gerente_id: "",
    gerente_nombre: "",
  })
  const [editando, setEditando] = useState<Gerente | null>(null)
  const [busqueda, setBusqueda] = useState("")
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
    if (id) {
      cargarGerenteParaEdicion(id)
    }
  }, [id])

  const cargarGerenteParaEdicion = async (gerenteId: string) => {
    try {
      setLoading(true)
      const res = await apiRequest("get", `/get/gerente/${gerenteId}`)
      const g = res.data
      setNuevoGerente({
        gerente_id: g.gerente_id || g.gerente_key || "",
        gerente_nombre: g.nombre || "",
      })
      setEditando(g)
    } catch (err: any) {
      console.error("Error al cargar gerente:", err)
      setError(err.response?.data?.message || "Error al cargar el gerente")
    } finally {
      setLoading(false)
    }
  }

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNuevoGerente((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const validarFormulario = () => {
    if (!nuevoGerente.gerente_id.trim()) {
      setError("El ID del gerente es requerido")
      return false
    }
    if (!nuevoGerente.gerente_nombre.trim()) {
      setError("El nombre del gerente es requerido")
      return false
    }
    return true
  }

  const crearGerente = async () => {
    if (!validarFormulario()) return

    try {
      setLoading(true)
      await apiRequest("post", "/post/gerente", nuevoGerente)
      setNuevoGerente({ gerente_id: "", gerente_nombre: "" })
      setError("")
      alert("Gerente creado exitosamente")
    } catch (err: any) {
      console.error("Error al crear gerente:", err)
      setError(err.response?.data?.message || "Error al crear el gerente")
    } finally {
      setLoading(false)
    }
  }

  const actualizarGerente = async () => {
    if (!editando?.gerente_key) return
    if (!nuevoGerente.gerente_nombre.trim()) {
      setError("El nombre del gerente es requerido")
      return
    }

    try {
      setLoading(true)
      await apiRequest("put", `/put/gerente/${editando.gerente_key}`, {
        gerente_nombre: nuevoGerente.gerente_nombre,
      })
      alert("Gerente actualizado exitosamente")
      cancelarEdicion()
    } catch (err: any) {
      console.error("Error al actualizar gerente:", err)
      setError(err.response?.data?.message || "Error al actualizar el gerente")
    } finally {
      setLoading(false)
    }
  }

  const buscarGerentePorId = async () => {
    if (!busqueda.trim()) {
      setError("Ingrese un ID para buscar")
      return
    }

    try {
      setLoading(true)
      await cargarGerenteParaEdicion(busqueda)
      setBusqueda("")
    } catch (err) {
      // El error ya se maneja en cargarGerenteParaEdicion
    }
  }

  const cancelarEdicion = () => {
    setEditando(null)
    setNuevoGerente({ gerente_id: "", gerente_nombre: "" })
    setError("")
    navigate("/lista-gerentes")
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
      <h2>Gestión de Gerentes</h2>

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
          placeholder="Buscar gerente por ID"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button onClick={buscarGerentePorId} disabled={loading}>
          Buscar
        </button>
      </div>

      <div className="formulario">
        <input
          type="text"
          name="gerente_id"
          placeholder="ID del Gerente"
          value={nuevoGerente.gerente_id}
          onChange={manejarCambio}
          disabled={!!editando || loading}
        />
        <input
          type="text"
          name="gerente_nombre"
          placeholder="Nombre del Gerente"
          value={nuevoGerente.gerente_nombre}
          onChange={manejarCambio}
          disabled={loading}
        />
        {editando ? (
          <>
            <button onClick={actualizarGerente} disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
            <button onClick={cancelarEdicion} className="btn-cancelar" disabled={loading}>
              Cancelar
            </button>
          </>
        ) : (
          <button onClick={crearGerente} disabled={loading}>
            {loading ? "Creando..." : "Crear"}
          </button>
        )}
      </div>

      <div className="mostrar-listado">
        <button onClick={() => navigate("/lista-gerentes")}>Ir al listado de gerentes</button>
      </div>
    </div>
  )
}

export default Gerentes
