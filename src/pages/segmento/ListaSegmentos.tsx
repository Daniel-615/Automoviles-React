"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "../../components/css/segmento.css"

interface Segmento {
  segmento_key: string
  segmento_id: string
  nombre: string
}

const PRIMARY_URL = "https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas"
const FALLBACK_URL = "http://127.0.0.1:5000/ventas"

const apiRequest = async (method: "get", endpoint: string, params?: any) => {
  try {
    return await axios({ method, url: `${PRIMARY_URL}${endpoint}`, params })
  } catch {
    return await axios({ method, url: `${FALLBACK_URL}${endpoint}`, params })
  }
}

const ListaSegmentos: React.FC = () => {
  const [segmentos, setSegmentos] = useState<Segmento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [total, setTotal] = useState(0)
  const navigate = useNavigate()

  const cargarSegmentos = async (pagina = 1) => {
    try {
      setLoading(true)
      const res = await apiRequest("get", "/get/segmento", {
        page: pagina,
        per_page: 12,
      })

      if (res.data.segmentos) {
        const formateados = res.data.segmentos.map((s: any) => ({
          segmento_key: s.segmento_key,
          segmento_id: s.segmento_id,
          nombre: s.nombre,
        }))
        setSegmentos(formateados)
        setTotal(res.data.total || formateados.length)
        setTotalPaginas(res.data.total_paginas || 1)
        setPaginaActual(res.data.pagina_actual || pagina)
      } else {
        // Si no hay estructura de paginación, usar datos directos
        const datos = Array.isArray(res.data) ? res.data : []
        setSegmentos(datos)
        setTotal(datos.length)
        setTotalPaginas(1)
        setPaginaActual(1)
      }
      setError("")
    } catch (err: any) {
      console.error("Error al obtener segmentos:", err)
      setError(err.response?.data?.message || "Error al cargar los segmentos")
      setSegmentos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarSegmentos()
  }, [])

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      cargarSegmentos(nuevaPagina)
    }
  }

  if (loading) {
    return (
      <div className="lista-container">
        <h1>Cargando segmentos...</h1>
      </div>
    )
  }

  return (
    <div className="lista-container">
      <div className="lista-header">
        <h1>Listado de Segmentos</h1>
        <button className="btn-volver" onClick={() => navigate("/segmentos")}>
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

      {segmentos.length === 0 ? (
        <p className="mensaje-vacio">No hay segmentos registrados.</p>
      ) : (
        <>
          <div style={{ marginBottom: "1rem", color: "#666" }}>
            Mostrando {segmentos.length} de {total} segmentos
            {totalPaginas > 1 && ` - Página ${paginaActual} de ${totalPaginas}`}
          </div>

          <div className="tarjetas-vendedores">
            {segmentos.map((s) => (
              <div
                className="tarjeta"
                key={s.segmento_key}
                onClick={() => navigate(`/segmentos/${s.segmento_key}`)}
                style={{ cursor: "pointer" }}
              >
                <h3>{s.nombre}</h3>
                <p>
                  <strong>ID:</strong> {s.segmento_id}
                </p>
                <p>
                  <strong>UUID:</strong> {s.segmento_key}
                </p>
              </div>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "2rem",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual <= 1}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: paginaActual <= 1 ? "#ccc" : "#1565c0",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: paginaActual <= 1 ? "not-allowed" : "pointer",
                }}
              >
                ← Anterior
              </button>

              <span
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {paginaActual} / {totalPaginas}
              </span>

              <button
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual >= totalPaginas}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: paginaActual >= totalPaginas ? "#ccc" : "#1565c0",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: paginaActual >= totalPaginas ? "not-allowed" : "pointer",
                }}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ListaSegmentos
