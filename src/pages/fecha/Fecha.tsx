"use client"

import type React from "react"
import { useState } from "react"
import "../../components/css/fecha.css"

interface FechaData {
  fecha_completa: string
  dia: number
  dia_semana: string
  semana: number
  mes: string
  trimestre: number
  año: number
  indicador_fin_semana: boolean
  indicador_feriado: boolean
}

const Fecha: React.FC = () => {
  const [formData, setFormData] = useState<FechaData>({
    fecha_completa: "",
    dia: 1,
    dia_semana: "",
    semana: 1,
    mes: "",
    trimestre: 1,
    año: new Date().getFullYear(),
    indicador_fin_semana: false,
    indicador_feriado: false,
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  // Función para calcular la semana del año
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? Number.parseInt(value) || 0 : value,
      }))
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value
    const date = new Date(dateValue)

    // Ajustar para zona horaria local
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000)

    setFormData((prev) => ({
      ...prev,
      fecha_completa: dateValue,
      dia: localDate.getDate(),
      dia_semana: diasSemana[localDate.getDay() === 0 ? 6 : localDate.getDay() - 1],
      mes: meses[localDate.getMonth()],
      año: localDate.getFullYear(),
      trimestre: Math.ceil((localDate.getMonth() + 1) / 3),
      semana: getWeekNumber(localDate),
      indicador_fin_semana: localDate.getDay() === 0 || localDate.getDay() === 6,
    }))
  }

  const handleNavigateToList = () => {
    // Navegar a la lista de fechas
    window.location.href = "/lista-fechas"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (!formData.fecha_completa) {
      setMessage({ text: "Por favor selecciona una fecha", type: "error" })
      setLoading(false)
      return
    }

    try {
      const response = await fetch(
        "https://cubosolap-cngzccemejb8g7b9.mexicocentral-01.azurewebsites.net/ventas/post/fecha",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      )

      const data = await response.json()

      if (response.ok) {
        setMessage({ text: "Fecha registrada exitosamente en el sistema", type: "success" })
        setFormData({
          fecha_completa: "",
          dia: 1,
          dia_semana: "",
          semana: 1,
          mes: "",
          trimestre: 1,
          año: new Date().getFullYear(),
          indicador_fin_semana: false,
          indicador_feriado: false,
        })
      } else {
        setMessage({ text: data.message || "Error al registrar la fecha", type: "error" })
      }
    } catch (error) {
      setMessage({ text: "Error de conexión con el servidor", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fecha-container">
      <div className="fecha-header">
        <h1>📅 Gestión de Fechas</h1>
        <p>Administra las fechas del sistema de ventas automotriz</p>
        <button type="button" onClick={handleNavigateToList} className="fecha-nav-button">
          <span>📋</span>
          Ver Lista de Fechas
        </button>
      </div>

      <div className="fecha-form-container">
        <form onSubmit={handleSubmit} className="fecha-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fecha_completa">
                <span className="label-icon">📅</span>
                Fecha Completa *
              </label>
              <input
                type="date"
                id="fecha_completa"
                name="fecha_completa"
                value={formData.fecha_completa}
                onChange={handleDateChange}
                required
                max={new Date(new Date().getFullYear() + 5, 11, 31).toISOString().split("T")[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="semana">
                <span className="label-icon">📊</span>
                Semana del Año
              </label>
              <input
                type="number"
                id="semana"
                name="semana"
                value={formData.semana}
                onChange={handleInputChange}
                min="1"
                max="53"
                readOnly
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dia">
                <span className="label-icon">📆</span>
                Día del Mes
              </label>
              <input
                type="number"
                id="dia"
                name="dia"
                value={formData.dia}
                onChange={handleInputChange}
                min="1"
                max="31"
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor="dia_semana">
                <span className="label-icon">🗓️</span>
                Día de la Semana
              </label>
              <input
                type="text"
                id="dia_semana"
                name="dia_semana"
                value={formData.dia_semana}
                readOnly
                placeholder="Selecciona una fecha"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mes">
                <span className="label-icon">🗓️</span>
                Mes
              </label>
              <input type="text" id="mes" name="mes" value={formData.mes} readOnly placeholder="Selecciona una fecha" />
            </div>

            <div className="form-group">
              <label htmlFor="trimestre">
                <span className="label-icon">📈</span>
                Trimestre
              </label>
              <input
                type="number"
                id="trimestre"
                name="trimestre"
                value={formData.trimestre}
                readOnly
                min="1"
                max="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="año">
                <span className="label-icon">📅</span>
                Año
              </label>
              <input type="number" id="año" name="año" value={formData.año} readOnly min="2000" max="2100" />
            </div>
          </div>

          <div className="form-row">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="indicador_fin_semana"
                  checked={formData.indicador_fin_semana}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                <span className="label-text">
                  <span className="label-icon">🏖️</span>
                  Fin de Semana
                </span>
              </label>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="indicador_feriado"
                  checked={formData.indicador_feriado}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                <span className="label-text">
                  <span className="label-icon">🎉</span>
                  Día Feriado
                </span>
              </label>
            </div>
          </div>

          {message && (
            <div className={`message ${message.type}`}>
              <span className="message-icon">{message.type === "success" ? "✅" : "❌"}</span>
              {message.text}
            </div>
          )}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Registrando Fecha...
              </>
            ) : (
              <>
                <span className="btn-icon">💾</span>
                Registrar Fecha
              </>
            )}
          </button>
        </form>

        <div className="fecha-info">
          <h3>
            <span>💡</span>
            Información sobre el Sistema de Fechas
          </h3>
          <ul>
            <li>🚗 Las fechas son fundamentales para el seguimiento de ventas automotrices</li>
            <li>📊 Los trimestres ayudan a analizar tendencias estacionales de ventas</li>
            <li>🏖️ Los fines de semana pueden tener patrones de venta diferentes</li>
            <li>🎉 Los días feriados afectan la disponibilidad del concesionario</li>
            <li>📈 El análisis temporal mejora la planificación de inventario</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Fecha
