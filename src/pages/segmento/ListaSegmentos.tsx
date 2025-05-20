import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../components/css/segmento.css';

interface Segmento {
  segmento_key: string;
  segmento_id: string;
  nombre: string;
}

const PRIMARY_URL = 'https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas';
const FALLBACK_URL = 'http://127.0.0.1:5000/ventas';

const fetchWithFallback = async (endpoint: string) => {
  try {
    return await axios.get(`${PRIMARY_URL}${endpoint}`);
  } catch {
    return await axios.get(`${FALLBACK_URL}${endpoint}`);
  }
};

const ListaSegmentos: React.FC = () => {
  const [segmentos, setSegmentos] = useState<Segmento[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWithFallback('/get/segmento')
      .then(res => {
        const datos = res.data.segmentos || res.data;
        setSegmentos(datos);
      })
      .catch(err => console.error('Error al obtener segmentos:', err));
  }, []);

  return (
    <div className="lista-container">
      <div className="lista-header">
        <h1>Listado de Segmentos</h1>
        <button className="btn-volver" onClick={() => navigate('/segmentos')}>
          ← Volver a Gestión
        </button>
      </div>

      {segmentos.length === 0 ? (
        <p className="mensaje-vacio">No hay segmentos registrados.</p>
      ) : (
        <div className="tarjetas-vendedores">
          {segmentos.map((s) => (
            <div className="tarjeta" key={s.segmento_key}>
              <h3>{s.nombre}</h3>
              <p><strong>ID:</strong> {s.segmento_id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaSegmentos;
