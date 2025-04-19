import { Routes, Route, Link } from 'react-router-dom'
import Tiendas from './pages/Tiendas'
import './App.css'

function App() {
  return (
    <>
      {/* Menú de navegación */}
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Inicio</Link>
        <Link to="/tiendas">Tiendas</Link>
      </nav>

      {/* Rutas */}
      <Routes>
        {/* Página de inicio */}
        <Route
          path="/"
          element={
            <div className="card">
              <h1>Bienvenido a la App de Automóviles</h1>
              <p>
                Tenemos amplia experiencia vendiendo automóviles. Por eso, contamos con múltiples tiendas en distintas ciudades.
              </p>
              <p className="read-the-docs">
                Haz clic en el enlace de Tiendas para ver las estadísticas.
              </p>
            </div>
          }
        />

        {/* Página de Tiendas */}
        <Route path="/tiendas" element={<Tiendas />} />
      </Routes>
    </>
  )
}

export default App
