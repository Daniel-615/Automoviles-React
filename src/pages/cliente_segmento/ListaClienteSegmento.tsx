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

const fetchWithFallback = async (endpoint: string) => {
  try {
    return await axios.get(`${PRIMARY_API}${endpoint}`)
  } catch {
    return await axios.get(`${FALLBACK_API}${endpoint}`)
  }
}

const ListaClienteSegmento: React.FC = () => {
  const [relaciones, setRelaciones] = useState<ClienteSegmento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [segmentos, setSegmentos] = useState<Segmento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)

      const [relacionesRes, clientesRes, segmentosRes] = await Promise.all([
        fetchWithFallback("/get/cliente_segmento"),
        fetchWithFallback("/get/cliente"),
        fetchWithFallback("/get/segmento"),
      ])

      setRelaciones(relacionesRes.data.clientes_segmento || relacionesRes.data)
      setClientes(clientesRes.data.clientes || clientesRes.data)
      setSegmentos(segmentosRes.data.segmentos || segmentosRes.data)
    } catch (err: any) {
      console.error("Error al obtener datos:", err)
      setError("Error al cargar los datos")
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

      {relaciones.length === 0 ? (
        <p className="mensaje-vacio">No hay relaciones registradas.</p>
      ) : (
        <>
          <div style={{ marginBottom: "1rem", color: "#666" }}>Total de relaciones: {relaciones.length}</div>

          <div className="tarjetas-vendedores">
            {relaciones.map((r) => (
              <div
                className="tarjeta"
                key={r.cliente_segmento_key}
                onClick={() => navigate(`/cliente-segmento/${r.cliente_segmento_key}`)}
                style={{ cursor: "pointer" }}
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
        </>
      )}
    </div>
  )
}

export default ListaClienteSegmento
