import PowerBIGrafico from "../../components/tiendaBi/Tiendas"
import "../../components/css/tiendasbi.css"

function Tiendas() {
  return (
    <div className="tiendas-bi-container">
      <div className="tiendas-bi-content">
        <div className="tiendas-bi-header">
          <h1 className="tiendas-bi-title">Estadísticas de Tiendas</h1>
          <p className="tiendas-bi-subtitle">Dashboard interactivo con métricas en tiempo real</p>
        </div>

        <div className="status-indicators">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span className="status-text">Sistema Activo</span>
          </div>
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span className="status-text">Datos Actualizados</span>
          </div>
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span className="status-text">Power BI Conectado</span>
          </div>
        </div>

        <div className="dashboard-container">
          <div className="powerbi-wrapper">
            <PowerBIGrafico />
          </div>

          <div className="dashboard-info">
            <div className="info-card">
              <div className="info-card-title">Total Ingresos</div>
              <div className="info-card-value">36.70K</div>
              <div className="info-card-description">Último mes</div>
            </div>
            <div className="info-card">
              <div className="info-card-title">Ventas Totales</div>
              <div className="info-card-value">12</div>
              <div className="info-card-description">Este período</div>
            </div>
            <div className="info-card">
              <div className="info-card-title">Tiendas Activas</div>
              <div className="info-card-value">8</div>
              <div className="info-card-description">En operación</div>
            </div>
            <div className="info-card">
              <div className="info-card-title">Rendimiento</div>
              <div className="info-card-value">95%</div>
              <div className="info-card-description">Eficiencia</div>
            </div>
          </div>

          <div className="dashboard-actions">
            <button className="action-btn">📊 Exportar Reporte</button>
            <button className="action-btn secondary">🔄 Actualizar Datos</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tiendas
