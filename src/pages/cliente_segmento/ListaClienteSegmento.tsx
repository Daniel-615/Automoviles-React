import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../components/css/cliente_segmento.css';

const PRIMARY_API = 'https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas';
const FALLBACK_API = 'http://localhost:5000/ventas';

interface ClienteSegmento {
  cliente_segmento_key?: string;
  cliente_key: string;
  segmento_key: string;
}

const fetchWithFallback = async (endpoint: string) => {
  try {
    return await axios.get(`${PRIMARY_API}${endpoint}`);
  } catch {
    return await axios.get(`${FALLBACK_API}${endpoint}`);
  }
};

const ListaClienteSegmento: React.FC = () => {
  const [relaciones, setRelaciones] = useState<ClienteSegmento[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWithFallback('/get/cliente_segmento')
      .then(res => {
        const datos = res.data.clientes_segmento || res.data;
        setRelaciones(datos);
      })
      .catch(err => console.error('Error al obtener relaciones:', err));
  }, []);

  return (
    <div className="lista-container">
      <div className="lista-header">
        <h1>Listado Cliente - Segmento</h1>
        <button className="btn-volver" onClick={() => navigate('/cliente-segmento')}>
          ← Volver a Gestión
        </button>
      </div>

      {relaciones.length === 0 ? (
        <p className="mensaje-vacio">No hay relaciones registradas.</p>
      ) : (
        <div className="tarjetas-vendedores">
          {relaciones.map((r) => (
            <div
              className="tarjeta"
              key={r.cliente_segmento_key}
              onClick={() => navigate(`/cliente-segmento/${r.cliente_segmento_key}`)}
              style={{ cursor: 'pointer' }}
            >
              <p><strong>Cliente:</strong> {r.cliente_key}</p>
              <p><strong>Segmento:</strong> {r.segmento_key}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaClienteSegmento;