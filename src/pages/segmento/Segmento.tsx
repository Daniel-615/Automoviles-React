import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../components/css/segmento.css';

const PRIMARY_URL = 'https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas';
const FALLBACK_URL = 'http://127.0.0.1:5000/ventas';

const hacerPeticion = async (config: any) => {
  try {
    return await axios({ ...config, url: config.url.replace('{BASE_URL}', PRIMARY_URL) });
  } catch (error) {
    console.warn('Fallo la URL principal. Usando fallback...');
    return axios({ ...config, url: config.url.replace('{BASE_URL}', FALLBACK_URL) });
  }
};

interface Segmento {
  segmento_key?: string;
  segmento_id: string;
  nombre: string;
}

const Segmento: React.FC = () => {
  const [nuevoSegmento, setNuevoSegmento] = useState<Omit<Segmento, 'segmento_key'>>({
    segmento_id: '',
    nombre: ''
  });
  const [editando, setEditando] = useState<string | null>(null);
  const [busquedaId, setBusquedaId] = useState('');
  const navigate = useNavigate();

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoSegmento(prev => ({ ...prev, [name]: value }));
  };

  const crearSegmento = () => {
    const { segmento_id, nombre } = nuevoSegmento;
    if (!segmento_id || !nombre) return;

    hacerPeticion({ method: 'POST', url: `${PRIMARY_URL}/post/segmento`, data: nuevoSegmento })
      .then(() => {
        setNuevoSegmento({ segmento_id: '', nombre: '' });
      })
      .catch(err => {
        console.error('Error al crear segmento:', err);
      });
  };

  const actualizarSegmento = () => {
    if (!editando) return;

    hacerPeticion({
      method: 'PUT',
      url: `${PRIMARY_URL}/put/segmento/${editando}`,
      data: { nombre: nuevoSegmento.nombre }
    })
      .then(() => {
        cancelarEdicion();
      })
      .catch(err => {
        console.error('Error al actualizar segmento:', err);
      });
  };

  const buscarSegmentoPorId = () => {
    if (!busquedaId) return;

    hacerPeticion({ method: 'GET', url: `${PRIMARY_URL}/get/segmento/${busquedaId}` })
      .then(res => {
        const s = res.data;
        console.log(`Segmento encontrado: ID: ${s.segmento_id} - Nombre: ${s.nombre}`);
      })
      .catch(err => {
        console.error('Segmento no encontrado:', err);
      });
  };

  const iniciarEdicion = (segmento: Segmento) => {
    if (!segmento.segmento_key) return;
    setEditando(segmento.segmento_key);
    setNuevoSegmento({ segmento_id: segmento.segmento_id, nombre: segmento.nombre });
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevoSegmento({ segmento_id: '', nombre: '' });
  };

  return (
    <div className="segmento-container">
      <h2>Gestión de Segmentos</h2>

      {/* Buscar por ID */}
      <div className="form-busqueda">
        <input
          type="text"
          placeholder="Buscar segmento por ID"
          value={busquedaId}
          onChange={(e) => setBusquedaId(e.target.value)}
        />
        <button onClick={buscarSegmentoPorId}>Buscar</button>
      </div>

      {/* Formulario */}
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

      {/* Botón para ver listado */}
      <div className="mostrar-listado">
        <button onClick={() => navigate('/lista-segmentos')}>Ir al listado de segmentos</button>
      </div>
    </div>
  );
};

export default Segmento;
