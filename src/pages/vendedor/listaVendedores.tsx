import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Vendedor } from './Vendedor';
import { useNavigate } from 'react-router-dom';
import '../../components/css/ListaVendedores.css'

const PRIMARY_API = 'https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas';
const FALLBACK_API = 'http://127.0.0.1:5000/ventas';

const axiosWithFallback = async (method: 'get' | 'post' | 'put', path: string, data?: any) => {
  try {
    return await axios({ method, url: `${PRIMARY_API}${path}`, data });
  } catch (error) {
    console.warn('Fallo la ruta principal. Usando fallback...');
    return await axios({ method, url: `${FALLBACK_API}${path}`, data });
  }
};

const ListaVendedores: React.FC = () => {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosWithFallback('get', '/get/vendedor')
      .then(res => setVendedores(res.data.vendedores || []))
      .catch(err => console.error('Error al obtener vendedores:', err));
  }, []);

  return (
    <div className="vendedores-page">
      <div className="vendedores-header">
        <h2>Listado de Vendedores</h2>
        <button className="volver-btn" onClick={() => navigate('/vendedor')}>
          ⬅ Volver a Gestión
        </button>
      </div>
      {vendedores.length === 0 ? (
    <p style={{ color: '#666' }}>No hay vendedores registrados.</p>
      ) : (
      <ul className="vendedores-lista">
        {vendedores.map(v => (
          <li key={v.vendedor_key} className="vendedor-card">
            <p><strong>Nombre:</strong> {v.nombre}</p>
            <p><strong>ID:</strong> {v.vendedor_id}</p>
            <p><strong>Edad:</strong> {v.edad}</p>
            <p><strong>Salario:</strong> Q{v.salario}</p>
            <p><strong>Activo:</strong> {v.activo ? 'Sí' : 'No'}</p>
          </li>
        ))}
      </ul>
    )}

    </div>
  );
};

export default ListaVendedores;
