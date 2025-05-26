"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "../../components/css/ListaGerentes.css"

interface Gerente {
  gerente_key: string
  gerente_id: string
  nombre: string
}

const PRIMARY_API = "https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas"
const FALLBACK_API = "http://localhost:5000/ventas"

const fetchWithFallback = async (endpoint: string) => {
  try {
    return await axios.get(`${PRIMARY_API}${endpoint}`)
  } catch {
    return await axios.get(`${FALLBACK_API}${endpoint}`)
  }
}

const ListaGerentes: React.FC = () => {
  const [gerentes, setGerentes] = useState<Gerente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    cargarGerentes()
  }, [])

  const cargarGerentes = async () => {
    try {
      setLoading(true)
      const res = await fetchWithFallback("/get/gerente")
      const datos = res.data.gerentes || res.data
      const formateados = datos
        .map(
          (g: any): Gerente => ({
            gerente_key: g.gerente_key || g.gerente_id || "",
            gerente_id: g.gerente_id || g.gerente_key || "",
            nombre: g.nombre,
          }),
        )
        .filter((g: Gerente) => g.gerente_key && g.nombre)
      setGerentes(formateados)
      setError("")
    } catch (err: any) {
      console.error("Error al obtener gerentes:", err)
      setError("Error al cargar los gerentes")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="lista-container">
        <h1>Cargando gerentes...</h1>
      </div>
    )
  }

  return (
    <div className="lista-container">
      <div className="lista-header">
        <h1>Listado de Gerentes</h1>
        <button className="btn-volver" onClick={() => navigate("/gerentes")}>
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

      {gerentes.length === 0 ? (
        <p className="mensaje-vacio">No hay gerentes registrados.</p>
      ) : (
        <>
          <div style={{ marginBottom: "1rem", color: "#666" }}>Total de gerentes: {gerentes.length}</div>

          <div className="tarjetas-vendedores">
            {gerentes.map((g) => (
              <div
                className="tarjeta"
                key={g.gerente_key}
                onClick={() => navigate(`/gerentes/${g.gerente_key}`)}
                style={{ cursor: "pointer" }}
              >
                <h3>{g.nombre}</h3>
                <p>
                  <strong>ID:</strong> {g.gerente_id}
                </p>
                <p>
                  <strong>UUID:</strong> {g.gerente_key}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ListaGerentes
