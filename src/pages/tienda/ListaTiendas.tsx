import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../components/css/Tiendas.css';

interface Tienda {
  tienda_key?: string;
  tienda_id: string;
  nombre_tienda: string;
  direccion: string;
  ciudad: string;
  tamaño_m2: number;
  horario_apertura: string;
  horario_cierre: string;
  gerente_key: string;
}

const PRIMARY_API = 'https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas';
const FALLBACK_API = 'http://127.0.0.1:5000/ventas';

const fetchWithFallback = async (endpoint: string) => {
  try {
    return await axios.get(`${PRIMARY_API}${endpoint}`);
  } catch {
    return await axios.get(`${FALLBACK_API}${endpoint}`);
  }
};

const ListaTiendas: React.FC = () => {
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWithFallback('/get/tienda')
      .then(res => {
        const datos = res.data.tiendas || res.data;
        setTiendas(datos);
      })
      .catch(err => console.error('Error al obtener tiendas:', err));
  }, []);

  const editarTienda = (uuid: string) => {
    navigate(`/tiendas?uuid=${uuid}`);
  };

  return (
    <div className="lista-container">
      <div className="lista-header">
        <h1>Listado de Tiendas</h1>
        <button className="btn-volver" onClick={() => navigate('/tiendas')}>
          ← Volver a Gestión
        </button>
      </div>

      {tiendas.length === 0 ? (
        <p className="mensaje-vacio">No hay tiendas registradas.</p>
      ) : (
        <div className="tarjetas-vendedores">
          {tiendas.map((t) => (
            <div
              className="tarjeta"
              key={t.tienda_key}
              onClick={() => editarTienda(t.tienda_key || '')}
              style={{ cursor: 'pointer' }}
            >
              <h3>{t.nombre_tienda}</h3>
              <p><strong>ID:</strong> {t.tienda_id}</p>
              <p><strong>Dirección:</strong> {t.direccion}</p>
              <p><strong>Ciudad:</strong> {t.ciudad}</p>
              <p><strong>Tamaño:</strong> {t.tamaño_m2} m²</p>
              <p><strong>Horario:</strong> {t.horario_apertura} - {t.horario_cierre}</p>
              <p><strong>Gerente:</strong> {t.gerente_key}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaTiendas;
