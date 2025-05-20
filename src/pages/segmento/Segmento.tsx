import React, { useState, ChangeEvent, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../../components/css/segmento.css';

const PRIMARY_URL = 'https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas';
const FALLBACK_URL = 'http://127.0.0.1:5000/ventas';

const hacerPeticion = async (config: any) => {
  try {
    return await axios({ ...config, url: config.url.replace('{BASE_URL}', PRIMARY_URL) });
  } catch {
    return axios({ ...config, url: config.url.replace('{BASE_URL}', FALLBACK_URL) });
  }
};

interface Segmento {
  segmento_key?: string;
  segmento_id: string;
  nombre: string;
}

const Segmento: React.FC = () => {
  const [nuevoSegmento, setNuevoSegmento] = useState<Omit<Segmento, 'segmento_key'>>({ segmento_id: '', nombre: '' });
  const [editando, setEditando] = useState<string | null>(null);
  const [busquedaId, setBusquedaId] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      hacerPeticion({ method: 'GET', url: `${PRIMARY_URL}/get/segmento/${id}` })
        .then(res => {
          const data = res.data;
          setEditando(data.segmento_key);
          setNuevoSegmento({ segmento_id: data.segmento_id, nombre: data.nombre });
        })
        .catch(err => console.error('Error al obtener segmento:', err));
    }
  }, [id]);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoSegmento(prev => ({ ...prev, [name]: value }));
  };

  const crearSegmento = () => {
    if (!nuevoSegmento.segmento_id || !nuevoSegmento.nombre) return;
    hacerPeticion({ method: 'POST', url: `${PRIMARY_URL}/post/segmento`, data: nuevoSegmento })
      .then(() => setNuevoSegmento({ segmento_id: '', nombre: '' }))
      .catch(err => console.error('Error al crear segmento:', err));
  };

  const actualizarSegmento = () => {
    if (!editando) return;
    hacerPeticion({
      method: 'PUT',
      url: `${PRIMARY_URL}/put/segmento/${editando}`,
      data: { nombre: nuevoSegmento.nombre }
    })
      .then(() => cancelarEdicion())
      .catch(err => console.error('Error al actualizar segmento:', err));
  };

  const buscarSegmentoPorId = () => {
    if (!busquedaId) return;
    hacerPeticion({ method: 'GET', url: `${PRIMARY_URL}/get/segmento/${busquedaId}` })
      .then(res => console.log('Segmento encontrado:', res.data))
      .catch(err => console.error('Segmento no encontrado:', err));
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevoSegmento({ segmento_id: '', nombre: '' });
    navigate('/lista-segmentos');
  };

  return (
    <div className="segmento-container">
      <h2>Gestión de Segmentos</h2>

      <div className="form-busqueda">
        <input
          type="text"
          placeholder="Buscar segmento por ID"
          value={busquedaId}
          onChange={(e) => setBusquedaId(e.target.value)}
        />
        <button onClick={buscarSegmentoPorId}>Buscar</button>
      </div>

      <div className="formulario">
        <input
          type="text"
          name="segmento_id"
          placeholder="ID Segmento"
          value={nuevoSegmento.segmento_id}
          onChange={manejarCambio}
          disabled={!!editando}
        />
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={nuevoSegmento.nombre}
          onChange={manejarCambio}
        />
        {editando ? (
          <>
            <button onClick={actualizarSegmento}>Actualizar</button>
            <button onClick={cancelarEdicion} className="btn-cancelar">Cancelar</button>
          </>
        ) : (
          <button onClick={crearSegmento}>Crear</button>
        )}
      </div>

      <div className="mostrar-listado">
        <button onClick={() => navigate('/lista-segmentos')}>Ir al listado de segmentos</button>
      </div>
    </div>
  );
};

export default Segmento;