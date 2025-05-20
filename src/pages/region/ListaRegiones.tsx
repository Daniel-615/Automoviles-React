import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../components/css/region.css';

interface Region {
  region_key: string;
  region_nombre: string;
}

const PRIMARY_API = 'https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas';
const FALLBACK_API = 'http://localhost:5000/ventas';

const fetchWithFallback = async (endpoint: string) => {
  try {
    return await axios.get(`${PRIMARY_API}${endpoint}`);
  } catch {
    return await axios.get(`${FALLBACK_API}${endpoint}`);
  }
};

const ListaRegiones: React.FC = () => {
  const [regiones, setRegiones] = useState<Region[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWithFallback('/get/region')
      .then(res => {
        const datos = res.data.regiones || res.data;
        setRegiones(datos);
      })
      .catch(err => console.error('Error al obtener regiones:', err));
  }, []);

  return (
    <div className="lista-container">
      <div className="lista-header">
        <h1>Listado de Regiones</h1>
        <button className="btn-volver" onClick={() => navigate('/region')}>
          ← Volver a Gestión
        </button>
      </div>

      {regiones.length === 0 ? (
        <p className="mensaje-vacio">No hay regiones registradas.</p>
      ) : (
        <div className="tarjetas-vendedores">
          {regiones.map((r) => (
            <div
              className="tarjeta"
              key={r.region_key}
              onClick={() => navigate(`/region/${r.region_key}`)}
              style={{ cursor: 'pointer' }}
            >
              <h3>{r.region_nombre}</h3>
              <p><strong>UUID:</strong> {r.region_key}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaRegiones;