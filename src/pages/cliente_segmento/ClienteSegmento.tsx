"use client"

import type React from "react"
import { useEffect, useState, type ChangeEvent } from "react"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import "../../components/css/cliente_segmento.css"

const PRIMARY_API = "https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas"
const FALLBACK_API = "http://localhost:5000/ventas"

interface ClienteSegmento {
  cliente_segmento_key?: string
  cliente_key: string
  segmento_key: string
}

interface Opcion {
  key: string
  nombre: string
}

const ClienteSegmento: React.FC = () => {
  const [nuevaRelacion, setNuevaRelacion] = useState<Omit<ClienteSegmento, "cliente_segmento_key">>({
    cliente_key: "",
    segmento_key: "",
  })
  const [clientes, setClientes] = useState<Opcion[]>([])
  const [segmentos, setSegmentos] = useState<Opcion[]>([])
  const [editando, setEditando] = useState<ClienteSegmento | null>(null)
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
    cargarDatosIniciales()
  }, [])

  useEffect(() => {
    if (id) {
      cargarRelacionParaEdicion(id)
    }
  }, [id])

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true)

      const [clientesRes, segmentosRes] = await Promise.all([
        apiRequest("get", "/get/cliente"),
        apiRequest("get", "/get/segmento"),
      ])

      const clientesData = clientesRes.data.clientes || clientesRes.data
      setClientes(
        clientesData.map((c: any) => ({
          key: c.cliente_key,
          nombre: `${c.nombre} ${c.apellido}`,
        })),
      )

      const segmentosData = segmentosRes.data.segmentos || segmentosRes.data
      setSegmentos(
        segmentosData.map((s: any) => ({
          key: s.segmento_key,
          nombre: s.nombre,
        })),
      )
    } catch (err) {
      console.error("Error al cargar datos:", err)
      setError("Error al cargar clientes y segmentos")
    } finally {
      setLoading(false)
    }
  }

  const cargarRelacionParaEdicion = async (relacionId: string) => {
    try {
      setLoading(true)
      const res = await apiRequest("get", `/get/cliente_segmento/${relacionId}`)
      const rel = res.data
      setNuevaRelacion({
        cliente_key: rel.cliente_key,
        segmento_key: rel.segmento_key,
      })
      setEditando(rel)
    } catch (err: any) {
      console.error("Error al cargar relación:", err)
      setError(err.response?.data?.message || "Error al cargar la relación")
    } finally {
      setLoading(false)
    }
  }

  const manejarCambio = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setNuevaRelacion((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const validarFormulario = () => {
    if (!nuevaRelacion.cliente_key) {
      setError("Debe seleccionar un cliente")
      return false
    }
    if (!nuevaRelacion.segmento_key) {
      setError("Debe seleccionar un segmento")
      return false
    }
    return true
  }

  const crearRelacion = async () => {
    if (!validarFormulario()) return

    try {
      setLoading(true)
      await apiRequest("post", "/post/cliente_segmento", nuevaRelacion)
      setNuevaRelacion({ cliente_key: "", segmento_key: "" })
      setError("")
      alert("Relación cliente-segmento creada exitosamente")
    } catch (err: any) {
      console.error("Error al crear relación:", err)
      setError(err.response?.data?.message || "Error al crear la relación")
    } finally {
      setLoading(false)
    }
  }

  const actualizarRelacion = async () => {
    if (!editando?.cliente_segmento_key) return
    if (!nuevaRelacion.segmento_key) {
      setError("Debe seleccionar un segmento")
      return
    }

    try {
      setLoading(true)
      await apiRequest("put", `/put/cliente_segmento/${editando.cliente_segmento_key}`, {
        segmento_key: nuevaRelacion.segmento_key,
      })
      alert("Relación actualizada exitosamente")
      cancelarEdicion()
    } catch (err: any) {
      console.error("Error al actualizar relación:", err)
      setError(err.response?.data?.message || "Error al actualizar la relación")
    } finally {
      setLoading(false)
    }
  }

  const buscarRelacionPorId = async () => {
    if (!busquedaId.trim()) {
      setError("Ingrese un ID para buscar")
      return
    }

    try {
      setLoading(true)
      await cargarRelacionParaEdicion(busquedaId)
      setBusquedaId("")
    } catch (err) {
      // El error ya se maneja en cargarRelacionParaEdicion
    }
  }

  const cancelarEdicion = () => {
    setEditando(null)
    setNuevaRelacion({ cliente_key: "", segmento_key: "" })
    setError("")
    navigate("/lista-cliente-segmento")
  }

  const obtenerNombreCliente = (key: string) => {
    const cliente = clientes.find((c) => c.key === key)
    return cliente ? cliente.nombre : key
  }

  const obtenerNombreSegmento = (key: string) => {
    const segmento = segmentos.find((s) => s.key === key)
    return segmento ? segmento.nombre : key
  }

  if (loading && clientes.length === 0) {
    return (
      <div className="relacion-container">
        <h2>Cargando...</h2>
      </div>
    )
  }

  return (
    <div className="relacion-container">
      <h2>Relación Cliente - Segmento</h2>

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
          placeholder="Buscar por ID"
          value={busquedaId}
          onChange={(e) => setBusquedaId(e.target.value)}
        />
        <button onClick={buscarRelacionPorId} disabled={loading}>
          Buscar
        </button>
        <button onClick={() => navigate("/lista-cliente-segmento")}>Ver Lista</button>
      </div>

      <div className="formulario">
        <select
          name="cliente_key"
          value={nuevaRelacion.cliente_key}
          onChange={manejarCambio}
          disabled={!!editando || loading}
        >
          <option value="">Selecciona un cliente</option>
          {clientes.map((c) => (
            <option key={c.key} value={c.key}>
              {c.nombre}
            </option>
          ))}
        </select>

        <select name="segmento_key" value={nuevaRelacion.segmento_key} onChange={manejarCambio} disabled={loading}>
          <option value="">Selecciona un segmento</option>
          {segmentos.map((s) => (
            <option key={s.key} value={s.key}>
              {s.nombre}
            </option>
          ))}
        </select>

        {editando ? (
          <>
            <button onClick={actualizarRelacion} disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
            <button onClick={cancelarEdicion} className="btn-cancelar" disabled={loading}>
              Cancelar
            </button>
          </>
        ) : (
          <button onClick={crearRelacion} disabled={loading}>
            {loading ? "Creando..." : "Crear"}
          </button>
        )}
      </div>

      {editando && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <h3>Editando relación:</h3>
          <p>
            <strong>Cliente:</strong> {obtenerNombreCliente(editando.cliente_key)}
          </p>
          <p>
            <strong>Segmento actual:</strong> {obtenerNombreSegmento(editando.segmento_key)}
          </p>
          <p>
            <em>Solo puede cambiar el segmento asignado</em>
          </p>
        </div>
      )}
    </div>
  )
}

export default ClienteSegmento
