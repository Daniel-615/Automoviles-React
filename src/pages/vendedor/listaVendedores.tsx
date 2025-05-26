"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import type { Vendedor } from "./Vendedor"
import { useNavigate } from "react-router-dom"
import "../../components/css/ListaVendedores.css"

const PRIMARY_API = "https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas"
const FALLBACK_API = "http://127.0.0.1:5000/ventas"

const axiosWithFallback = async (method: "get" | "post" | "put", path: string, data?: any) => {
  try {
    return await axios({ method, url: `${PRIMARY_API}${path}`, data })
  } catch (error) {
    console.warn("Fallo la ruta principal. Usando fallback...")
    return await axios({ method, url: `${FALLBACK_API}${path}`, data })
  }
}

const ListaVendedores: React.FC = () => {
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    cargarVendedores()
  }, [])

  const cargarVendedores = async () => {
    try {
      setLoading(true)
      const res = await axiosWithFallback("get", "/get/vendedor")
      const datos = res.data.vendedores || res.data
      const formateados = datos.filter((v: Vendedor) => v.vendedor_key && v.nombre)
      setVendedores(formateados)
      setError("")
    } catch (err: any) {
      console.error("Error al obtener vendedores:", err)
      setError("Error al cargar los vendedores")
    } finally {
      setLoading(false)
    }
  }

  const editarVendedor = (id: string) => {
    navigate(`/vendedor/${id}`)
  }

  if (loading) {
    return (
      <div className="vendedores-page">
        <h2>Cargando vendedores...</h2>
      </div>
    )
  }

  return (
    <div className="vendedores-page">
      <div className="vendedores-header">
        <h2>Listado de Vendedores</h2>
        <button className="volver-btn" onClick={() => navigate("/vendedor")}>
          ⬅ Volver a Gestión
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

      {vendedores.length === 0 ? (
        <p className="mensaje-vacio" style={{ color: "#666", textAlign: "center" }}>
          No hay vendedores registrados.
        </p>
      ) : (
        <>
          <div style={{ marginBottom: "1rem", color: "#666" }}>Total de vendedores: {vendedores.length}</div>

          <ul className="vendedores-lista">
            {vendedores.map((v) => (
              <li
                key={v.vendedor_key}
                className="vendedor-card"
                onClick={() => editarVendedor(v.vendedor_key || "")}
                style={{ cursor: "pointer" }}
              >
                <p>
                  <strong>Nombre:</strong> {v.nombre}
                </p>
                <p>
                  <strong>ID:</strong> {v.vendedor_id}
                </p>
                <p>
                  <strong>Edad:</strong> {v.edad} años
                </p>
                <p>
                  <strong>Salario:</strong> Q{v.salario?.toLocaleString()}
                </p>
                <p>
                  <strong>Activo:</strong> {v.activo ? "Sí" : "No"}
                </p>
                <p>
                  <strong>UUID:</strong> {v.vendedor_key}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default ListaVendedores
