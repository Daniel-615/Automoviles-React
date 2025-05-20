import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../components/css/Ciudades.css';

interface Ciudad {
  ciudad_key: string;
  ciudad_id: string;
  ciudad_nombre: string;
  region_key?: string;
}

const PRIMARY_API = 'https://microservicio_ventas.serveo.net/ventas';
const FALLBACK_API = 'http://127.0.0.1:5000/ventas';

const fetchWithFallback = async (endpoint: string) => {
  try {
    return await axios.get(`${PRIMARY_API}${endpoint}`);
  } catch {
    return await axios.get(`${FALLBACK_API}${endpoint}`);
  }
};

const ListaCiudades: React.FC = () => {
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWithFallback('/get/ciudad')
      .then(res => {
        const datos = res.data.ciudades || res.data;
        const formateadas = datos.map((c: any) => ({
          ciudad_key: c.ciudad_key || c.ciudad_id,
          ciudad_id: c.ciudad_id || c.ciudad_key,
          ciudad_nombre: c.ciudad_nombre || c.nombre,
          region_key: c.region_key || ''
        })).filter((c: Ciudad) => c.ciudad_key && c.ciudad_nombre);
        setCiudades(formateadas);
      })
      .catch(err => console.error('Error al obtener ciudades:', err));
  }, []);

  return (
    <div className="lista-container">
      <div className="lista-header">
        <h1>Listado de Ciudades</h1>
        <button className="btn-volver" onClick={() => navigate('/ciudades')}>
          ← Volver a Gestión
        </button>
      </div>

      {ciudades.length === 0 ? (
        <p className="mensaje-vacio">No hay ciudades registradas.</p>
      ) : (
        <div className="tarjetas-vendedores">
          {ciudades.map((c) => (
            <div className="tarjeta" key={c.ciudad_key}>
              <h3>{c.ciudad_nombre}</h3>
              <p><strong>ID:</strong> {c.ciudad_id}</p>
              <p><strong>Región:</strong> {c.region_key || 'N/A'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaCiudades;
