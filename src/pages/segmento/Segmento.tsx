import React, { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';
import '../../components/css/Segmento.css';

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
  const [segmentos, setSegmentos] = useState<Segmento[]>([]);
  const [nuevoSegmento, setNuevoSegmento] = useState<Omit<Segmento, 'segmento_key'>>({
    segmento_id: '',
    nombre: ''
  });
  const [editando, setEditando] = useState<string | null>(null);
  const [busquedaId, setBusquedaId] = useState('');

  const obtenerSegmentos = () => {
    hacerPeticion({ method: 'GET', url: '{BASE_URL}/get/segmento' })
      .then(res => setSegmentos(res.data.segmentos || []))
      .catch(err => {
        console.error('Error al obtener segmentos:', err);
      });
  };

  useEffect(() => {
    obtenerSegmentos();
  }, []);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoSegmento(prev => ({ ...prev, [name]: value }));
  };

  const crearSegmento = () => {
    const { segmento_id, nombre } = nuevoSegmento;
    if (!segmento_id || !nombre) return;

    hacerPeticion({ method: 'POST', url: '{BASE_URL}/post/segmento', data: nuevoSegmento })
      .then(() => {
        obtenerSegmentos();
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
      url: `{BASE_URL}/put/segmento/${editando}`,
      data: { nombre: nuevoSegmento.nombre }
    })
      .then(() => {
        obtenerSegmentos();
        cancelarEdicion();
      })
      .catch(err => {
        console.error('Error al actualizar segmento:', err);
      });
  };

  const buscarSegmentoPorId = () => {
    if (!busquedaId) return;

    hacerPeticion({ method: 'GET', url: `{BASE_URL}/get/segmento/${busquedaId}` })
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

      {/* Lista */}
      <ul className="lista-segmentos">
        {segmentos.map((s) => (
          <li key={s.segmento_key}>
            <strong>{s.nombre}</strong> - {s.segmento_id}
            <button onClick={() => iniciarEdicion(s)}>Editar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Segmento;
