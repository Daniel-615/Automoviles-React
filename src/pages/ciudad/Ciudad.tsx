import React, { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';
import '../../components/css/Ciudades.css';

const PRIMARY_API = 'https://microservicio_ventas.serveo.net/ventas';
const FALLBACK_API = 'http://127.0.0.1:5000/ventas';

interface Ciudad {
  ciudad_key: string;
  ciudad_id: string;
  ciudad_nombre: string;
  region_key?: string;
}

const Ciudades: React.FC = () => {
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [nuevaCiudad, setNuevaCiudad] = useState<Omit<Ciudad, 'ciudad_id'>>({
    ciudad_nombre: '',
    ciudad_key: '',
    region_key: ''
  });
  const [editando, setEditando] = useState<Ciudad | null>(null);
  const [busquedaId, setBusquedaId] = useState('');

  const apiRequest = async (method: 'get' | 'post' | 'put', endpoint: string, body?: any) => {
    try {
      return await axios({ method, url: `${PRIMARY_API}${endpoint}`, data: body });
    } catch {
      return await axios({ method, url: `${FALLBACK_API}${endpoint}`, data: body });
    }
  };

  const obtenerCiudades = () => {
    apiRequest('get', '/get/ciudad')
      .then(res => {
        const datos = res.data.ciudades || res.data;
        const formateadas = datos.map((c: any) => ({
          ciudad_key: c.ciudad_key || c.ciudad_id,
          ciudad_id: c.ciudad_id || c.ciudad_key,
          ciudad_nombre: c.ciudad_nombre || c.nombre,
          region_key: c.region_key || ''
        })).filter((c: Ciudad) => c.ciudad_key && c.ciudad_nombre);
        setCiudades(formateadas);
      })
      .catch(err => {
        console.error('Error al obtener ciudades:', err);
      });
  };

  useEffect(() => {
    obtenerCiudades();
  }, []);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevaCiudad({ ...nuevaCiudad, [name]: value });
  };

  const crearCiudad = () => {
    if (!nuevaCiudad.ciudad_nombre || !nuevaCiudad.ciudad_key || !nuevaCiudad.region_key) return;

    const payload = {
      ciudad_id: nuevaCiudad.ciudad_key,
      ciudad_nombre: nuevaCiudad.ciudad_nombre,
      region_key: nuevaCiudad.region_key
    };

    apiRequest('post', '/post/ciudad', payload)
      .then(() => {
        obtenerCiudades();
        setNuevaCiudad({ ciudad_nombre: '', ciudad_key: '', region_key: '' });
      })
      .catch(err => {
        console.error('Error al crear ciudad:', err);
      });
  };

  const actualizarCiudad = () => {
    if (!editando?.ciudad_key) return;

    const payload = { ciudad_nombre: nuevaCiudad.ciudad_nombre };

    apiRequest('put', `/put/ciudad/${editando.ciudad_key}`, payload)
      .then(() => {
        obtenerCiudades();
        cancelarEdicion();
      })
      .catch(err => {
        console.error('Error al actualizar ciudad:', err);
      });
  };

  const obtenerCiudadPorId = (id: string) => {
    apiRequest('get', `/get/ciudad/${id}`)
      .then(res => {
        const c = res.data;
        console.log('Ciudad encontrada:', c);
      })
      .catch(err => {
        console.error('Ciudad no encontrada:', err);
      });
  };

  const iniciarEdicion = (ciudad: Ciudad) => {
    setEditando(ciudad);
    setNuevaCiudad({
      ciudad_nombre: ciudad.ciudad_nombre,
      ciudad_key: ciudad.ciudad_key,
      region_key: ciudad.region_key || ''
    });
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevaCiudad({ ciudad_nombre: '', ciudad_key: '', region_key: '' });
  };

  return (
    <div className="ciudad-container">
      <h2>Gestión de Ciudades</h2>

      <div className="form-busqueda">
        <input
          type="text"
          placeholder="Buscar ciudad por ID"
          value={busquedaId}
          onChange={(e) => setBusquedaId(e.target.value)}
        />
        <button onClick={() => obtenerCiudadPorId(busquedaId)}>Buscar</button>
      </div>

      <div className="formulario">
        <input
          name="ciudad_nombre"
          placeholder="Nombre"
          value={nuevaCiudad.ciudad_nombre}
          onChange={manejarCambio}
        />
        <input
          name="ciudad_key"
          placeholder="UUID ciudad"
          value={nuevaCiudad.ciudad_key}
          onChange={manejarCambio}
          disabled={!!editando}
        />
        {!editando && (
          <input
            name="region_key"
            placeholder="UUID región"
            value={nuevaCiudad.region_key}
            onChange={manejarCambio}
          />
        )}
        {editando ? (
          <>
            <button onClick={actualizarCiudad}>Actualizar</button>
            <button onClick={cancelarEdicion} className="btn-cancelar">Cancelar</button>
          </>
        ) : (
          <button onClick={crearCiudad}>Crear</button>
        )}
      </div>

      <ul className="lista-ciudades">
        {ciudades.map((c) => (
          <li key={c.ciudad_key}>
            <div>
              <strong>{c.ciudad_nombre}</strong> - {c.ciudad_id}
            </div>
            <div>
              <button onClick={() => iniciarEdicion(c)}>Editar</button>
              <button onClick={() => obtenerCiudadPorId(c.ciudad_key)} className="btn-ver">Ver</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Ciudades;
