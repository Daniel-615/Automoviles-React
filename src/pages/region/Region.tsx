import React, { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';
import '../../components/css/Region.css';

const PRIMARY_API = 'https://microservicio_ventas.serveo.net/ventas';
const FALLBACK_API = 'http://localhost:5000/ventas';

interface Region {
  region_key?: string;
  region_nombre: string;
}

const Region: React.FC = () => {
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [nuevaRegion, setNuevaRegion] = useState<Region>({ region_nombre: '' });
  const [editando, setEditando] = useState<string | null>(null);
  const [busquedaId, setBusquedaId] = useState('');

  const apiRequest = async (method: 'get' | 'post' | 'put', endpoint: string, body?: any) => {
    const url = `${PRIMARY_API}${endpoint}`;
    const fallbackUrl = `${FALLBACK_API}${endpoint}`;
    try {
      return await axios({ method, url, data: body });
    } catch {
      return await axios({ method, url: fallbackUrl, data: body });
    }
  };

  const obtenerRegiones = () => {
    apiRequest('get', '/get/region')
      .then(res => setRegiones(res.data.regiones || []))
      .catch(err => {
        console.error('Error al obtener regiones:', err);
      });
  };

  useEffect(() => {
    obtenerRegiones();
  }, []);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    setNuevaRegion({ ...nuevaRegion, [e.target.name]: e.target.value });
  };

  const crearRegion = () => {
    if (!nuevaRegion.region_nombre) return;

    apiRequest('post', '/post/region', nuevaRegion)
      .then(() => {
        obtenerRegiones();
        setNuevaRegion({ region_nombre: '' });
      })
      .catch(err => {
        console.error('Error al crear la región:', err);
      });
  };

  const actualizarRegion = () => {
    if (!editando) return;

    apiRequest('put', `/put/region/${editando}`, { region_nombre: nuevaRegion.region_nombre })
      .then(() => {
        obtenerRegiones();
        cancelarEdicion();
      })
      .catch(err => {
        console.error('Error al actualizar la región:', err);
      });
  };

  const buscarRegionPorId = () => {
    if (!busquedaId) return;

    apiRequest('get', `/get/region/${busquedaId}`)
      .then(res => {
        const r = res.data;
        console.log(`Región encontrada: ${r.nombre}`);
      })
      .catch(err => {
        console.error('Región no encontrada:', err);
      });
  };

  const iniciarEdicion = (region: Region) => {
    setEditando(region.region_key || null);
    setNuevaRegion({ region_nombre: region.region_nombre });
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevaRegion({ region_nombre: '' });
  };

  return (
    <div className="region-container">
      <h2>Gestión de Regiones</h2>

      {/* Buscar por ID */}
      <div className="form-busqueda">
        <input
          type="text"
          placeholder="Buscar región por ID"
          value={busquedaId}
          onChange={(e) => setBusquedaId(e.target.value)}
        />
        <button onClick={buscarRegionPorId}>Buscar</button>
      </div>

      {/* Formulario */}
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

      {/* Lista */}
      <ul className="lista-regiones">
        {regiones.map((r) => (
          <li key={r.region_key}>
            <strong>{r.region_nombre}</strong> - {r.region_key}
            <div>
              <button onClick={() => iniciarEdicion(r)}>Editar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Region;
