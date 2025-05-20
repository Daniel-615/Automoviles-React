import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
  const [nuevaCiudad, setNuevaCiudad] = useState<Omit<Ciudad, 'ciudad_id'>>({
    ciudad_nombre: '',
    ciudad_key: '',
    region_key: ''
  });
  const [editando, setEditando] = useState<Ciudad | null>(null);
  const [busquedaId, setBusquedaId] = useState('');
  const navigate = useNavigate();

  const apiRequest = async (method: 'get' | 'post' | 'put', endpoint: string, body?: any) => {
    try {
      return await axios({ method, url: `${PRIMARY_API}${endpoint}`, data: body });
    } catch {
      return await axios({ method, url: `${FALLBACK_API}${endpoint}`, data: body });
    }
  };

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

      <div className="mostrar-listado">
        <button onClick={() => navigate('/lista-ciudades')}>Ir al listado de ciudades</button>
      </div>
    </div>
  );
};

export default Ciudades;
