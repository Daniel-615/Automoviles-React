"use client"

import type React from "react"
import { useState } from "react"
import "../../components/css/fecha.css"

interface FechaData {
  fecha_completa: string
  dia: number
  dia_semana: string
  semana: number
  mes: number // Cambiado de string a number
  trimestre: number
  año: number
  indicador_fin_semana: number // Cambiado de boolean a number
  indicador_feriado: number // Cambiado de boolean a number
}

const Fecha: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const [formData, setFormData] = useState<FechaData>({
    fecha_completa: "",
    dia: 1,
    dia_semana: "",
    semana: 1,
    mes: 1, // Cambiado de "" a 1
    trimestre: 1,
    año: new Date().getFullYear(),
    indicador_fin_semana: 0, // Cambiado de false a 0
    indicador_feriado: 0, // Cambiado de false a 0
  })

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

  // Manejar cambio en la fecha completa
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value
    if (dateValue) {
      const selectedDate = new Date(dateValue)
      const dayOfWeek = selectedDate.getDay()

      setFormData({
        fecha_completa: dateValue,
        dia: selectedDate.getDate(),
        dia_semana: diasSemana[dayOfWeek === 0 ? 6 : dayOfWeek - 1], // Convertir domingo
        mes: selectedDate.getMonth() + 1, // Cambiado para enviar número (1-12)
        trimestre: Math.ceil((selectedDate.getMonth() + 1) / 3),
        semana: getWeekNumber(selectedDate),
        año: selectedDate.getFullYear(),
        indicador_fin_semana: dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0, // Convertir a 1 o 0
        indicador_feriado: formData.indicador_feriado,
      })
    } else {
      setFormData({
        ...formData,
        fecha_completa: dateValue,
      })
    }
  }

  // Manejar cambios en campos individuales
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({
        ...prev,
        [name]: checked ? 1 : 0, // Convertir boolean a number
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? Number.parseInt(value) || 0 : value,
      }))
    }
  }

  // Manejar envío del formulario
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
        setMessage({ text: "Fecha registrada exitosamente", type: "success" })
        // Resetear formulario
        setFormData({
          fecha_completa: "",
          dia: 1,
          dia_semana: "",
          semana: 1,
          mes: 1, // Cambiado de "" a 1
          trimestre: 1,
          año: new Date().getFullYear(),
          indicador_fin_semana: 0, // Cambiado de false a 0
          indicador_feriado: 0, // Cambiado de false a 0
        })
      } else {
        setMessage({ text: data.message || "Error al registrar la fecha", type: "error" })
      }
    } catch (error) {
      setMessage({ text: "Error de conexión", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleNavigateToList = () => {
    window.location.href = "/lista-fechas"
  }

  return (
    <div className="fecha-container">
      <div className="fecha-card">
        <div className="fecha-header">
          <div className="header-content">
            <div className="header-icon">📅</div>
            <div className="header-text">
              <h1>Gestión de Fechas</h1>
              <p>Administra las fechas del sistema de ventas automotriz</p>
            </div>
          </div>
          <button onClick={handleNavigateToList} className="view-list-btn">
            📋 Ver Lista de Fechas
          </button>
        </div>

        <form onSubmit={handleSubmit} className="fecha-form">
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">📅</span>
              Información de Fecha
            </h3>

            <div className="form-grid">
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
                  className="form-input"
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
                  className="form-input"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label htmlFor="dia">
                  <span className="label-icon">📅</span>
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
                  className="form-input"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label htmlFor="dia_semana">
                  <span className="label-icon">📅</span>
                  Día de la Semana
                </label>
                <input
                  type="text"
                  id="dia_semana"
                  name="dia_semana"
                  value={formData.dia_semana}
                  onChange={handleInputChange}
                  className="form-input"
                  readOnly
                  placeholder="Selecciona una fecha"
                />
              </div>

              <div className="form-group">
                <label htmlFor="mes">
                  <span className="label-icon">📅</span>
                  Mes
                </label>
                <input
                  type="text"
                  id="mes"
                  name="mes"
                  value={formData.mes > 0 ? meses[formData.mes - 1] : ""} // Mostrar nombre del mes
                  onChange={handleInputChange}
                  className="form-input"
                  readOnly
                  placeholder="Selecciona una fecha"
                />
              </div>

              <div className="form-group">
                <label htmlFor="trimestre">
                  <span className="label-icon">📊</span>
                  Trimestre
                </label>
                <input
                  type="number"
                  id="trimestre"
                  name="trimestre"
                  value={formData.trimestre}
                  onChange={handleInputChange}
                  min="1"
                  max="4"
                  className="form-input"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label htmlFor="año">
                  <span className="label-icon">📅</span>
                  Año
                </label>
                <input
                  type="number"
                  id="año"
                  name="año"
                  value={formData.año}
                  onChange={handleInputChange}
                  min="2020"
                  max="2030"
                  className="form-input"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">⚙️</span>
              Configuraciones Especiales
            </h3>

            <div className="checkbox-grid">
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="indicador_fin_semana"
                    checked={formData.indicador_fin_semana === 1} // Convertir number a boolean para UI
                    onChange={handleInputChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-text">
                    <span className="checkbox-icon">🏖️</span>
                    Fin de Semana
                  </span>
                </label>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="indicador_feriado"
                    checked={formData.indicador_feriado === 1} // Convertir number a boolean para UI
                    onChange={handleInputChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-text">
                    <span className="checkbox-icon">🎉</span>
                    Día Feriado
                  </span>
                </label>
              </div>
            </div>
          </div>

          {message && (
            <div className={`message ${message.type}`}>
              <span className="message-icon">{message.type === "success" ? "✅" : "❌"}</span>
              <span className="message-text">{message.text}</span>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Registrando...
                </>
              ) : (
                <>
                  <span className="btn-icon">💾</span>
                  Registrar Fecha
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Fecha
