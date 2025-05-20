import React, { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../../components/css/region.css';

const PRIMARY_API = 'https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas';
const FALLBACK_API = 'http://localhost:5000/ventas';

interface Region {
  region_key?: string;
  region_nombre: string;
}

const Region: React.FC = () => {
  const [nuevaRegion, setNuevaRegion] = useState<Region>({ region_nombre: '' });
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
          setNuevaRegion({ region_nombre: r.region_nombre });
          setEditando(r.region_key || r.region_id);
        })
        .catch(err => console.error('Región no encontrada:', err));
    }
  }, [id]);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    setNuevaRegion({ ...nuevaRegion, [e.target.name]: e.target.value });
  };

  const crearRegion = () => {
    if (!nuevaRegion.region_nombre) return;

    apiRequest('post', '/post/region', nuevaRegion)
      .then(() => setNuevaRegion({ region_nombre: '' }))
      .catch(err => console.error('Error al crear la región:', err));
  };

  const actualizarRegion = () => {
    if (!editando) return;

    apiRequest('put', `/put/region/${editando}`, { region_nombre: nuevaRegion.region_nombre })
      .then(() => cancelarEdicion())
      .catch(err => console.error('Error al actualizar la región:', err));
  };

  const buscarRegionPorId = () => {
    if (!busquedaId) return;

    apiRequest('get', `/get/region/${busquedaId}`)
      .then(res => {
        const r = res.data;
        setNuevaRegion({ region_nombre: r.region_nombre });
        setEditando(r.region_key || r.region_id);
      })
      .catch(err => console.error('Región no encontrada:', err));
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevaRegion({ region_nombre: '' });
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
          name="region_nombre"
          placeholder="Nombre de región"
          value={nuevaRegion.region_nombre}
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