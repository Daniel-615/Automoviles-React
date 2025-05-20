import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../components/css/vendedor_tienda.css';

interface VendedorTienda {
  id?: string;
  vendedor_key: string;
  tienda_key: string;
  fecha_renuncia?: string;
  activo?: boolean;
}

const PRIMARY_API = 'https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas/vendedor/tienda';
const FALLBACK_API = 'http://127.0.0.1:5000/ventas/vendedor/tienda';

const fetchWithFallback = async (endpoint: string) => {
  try {
    return await axios.get(`${PRIMARY_API}${endpoint}`);
  } catch {
    return await axios.get(`${FALLBACK_API}${endpoint}`);
  }
};

const ListaVendedorTienda: React.FC = () => {
  const [registros, setRegistros] = useState<VendedorTienda[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWithFallback('/get')
      .then(res => {
        const datos = res.data.vendedor_tienda || res.data;
        setRegistros(datos);
      })
      .catch(err => console.error('Error al obtener registros:', err));
  }, []);

  return (
    <div className="lista-container">
      <div className="lista-header">
        <h1>Relaciones Vendedor - Tienda</h1>
        <button className="btn-volver" onClick={() => navigate('/vendedor_tienda')}>
          ← Volver a Gestión
        </button>
      </div>

      {registros.length === 0 ? (
        <p className="mensaje-vacio">No hay registros disponibles.</p>
      ) : (
        <div className="tarjetas-vendedores">
          {registros.map((r) => (
            <div className="tarjeta" key={r.id} onClick={() => navigate(`/vendedor-tienda/${r.id}`)} style={{ cursor: 'pointer' }}>
              <p><strong>Vendedor:</strong> {r.vendedor_key}</p>
              <p><strong>Tienda:</strong> {r.tienda_key}</p>
              <p><strong>Activo:</strong> {r.activo ? 'Sí' : 'No'}</p>
              <p><strong>Fecha Renuncia:</strong> {r.fecha_renuncia || 'N/A'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaVendedorTienda;