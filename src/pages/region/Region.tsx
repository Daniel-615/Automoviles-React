import React, { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../../components/css/region.css';

const PRIMARY_API = 'https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas';
const FALLBACK_API = 'http://localhost:5000/ventas';

interface Region {
  region_key?: string;
  nombre: string;
}

const Region: React.FC = () => {
  const [nuevaRegion, setNuevaRegion] = useState<Region>({ nombre: '' });
  const [editando, setEditando] = useState<string | null>(null);
  const [busquedaId, setBusquedaId] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  const apiRequest = async (method: 'get' | 'post' | 'put', endpoint: string, body?: any) => {
    try {
      return await axios({ method, url: `${PRIMARY_API}${endpoint}`, data: body });
    } catch {
      return await axios({ method, url: `${FALLBACK_API}${endpoint}`, data: body });
    }
  };

  useEffect(() => {
    if (id) {
      apiRequest('get', `/get/region/${id}`)
        .then(res => {
          const r = res.data;
          setNuevaRegion({ nombre: r.nombre });
          setEditando(id);
        })
        .catch(err => console.error('Región no encontrada:', err));
    }
  }, [id]);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    setNuevaRegion({ ...nuevaRegion, [e.target.name]: e.target.value });
  };

  const crearRegion = () => {
    if (!nuevaRegion.nombre.trim()) return;

    apiRequest('post', '/post/region', { region_nombre: nuevaRegion.nombre })
      .then(() => {
        setNuevaRegion({ nombre: '' });
        setEditando(null);
      })
      .catch(err => console.error('Error al crear la región:', err));
  };

  const actualizarRegion = () => {
    if (!editando) return;

    apiRequest('put', `/put/region/${editando}`, { region_nombre: nuevaRegion.nombre })
      .then(() => {
        cancelarEdicion();
      })
      .catch(err => console.error('Error al actualizar la región:', err));
  };

  const buscarRegionPorId = () => {
    if (!busquedaId.trim()) return;

    apiRequest('get', `/get/region/${busquedaId}`)
      .then(res => {
        const r = res.data;
        setNuevaRegion({ nombre: r.nombre });
        setEditando(busquedaId);
      })
      .catch(err => console.error('Región no encontrada:', err));
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevaRegion({ nombre: '' });
    setBusquedaId('');
    navigate('/lista-regiones');
  };

  return (
    <div className="region-container">
      <h2>Gestión de Regiones</h2>

      <div className="form-busqueda">
        <input
          type="text"
          placeholder="Buscar región por ID"
          value={busquedaId}
          onChange={(e) => setBusquedaId(e.target.value)}
        />
        <button onClick={buscarRegionPorId}>Buscar</button>
      </div>

      <div className="formulario">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre de región"
          value={nuevaRegion.nombre}
          onChange={manejarCambio}
        />
        {editando ? (
          <>
            <button onClick={actualizarRegion}>Actualizar</button>
            <button onClick={cancelarEdicion} className="btn-cancelar">Cancelar</button>
          </>
        ) : (
          <button onClick={crearRegion}>Crear</button>
        )}
      </div>

      <div className="mostrar-listado">
        <button onClick={() => navigate('/lista-regiones')}>Ir al listado de regiones</button>
      </div>
    </div>
  );
};

export default Region;
