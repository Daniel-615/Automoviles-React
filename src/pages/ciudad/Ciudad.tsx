import React, { useState, ChangeEvent, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../../components/css/Ciudades.css';

const PRIMARY_API = 'https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas';
const FALLBACK_API = 'http://127.0.0.1:5000/ventas';

interface Ciudad {
  ciudad_key: string;
  ciudad_id: string;
  ciudad_nombre: string;
  region_key?: string;
}

interface Region {
  region_key: string;
  region_nombre: string;
}

const Ciudades: React.FC = () => {
  const [nuevaCiudad, setNuevaCiudad] = useState<Omit<Ciudad, 'ciudad_id'>>({
    ciudad_nombre: '',
    ciudad_key: '',
    region_key: ''
  });
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [editando, setEditando] = useState<boolean>(false);
  const [busquedaId, setBusquedaId] = useState('');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const apiRequest = async (method: 'get' | 'post' | 'put', endpoint: string, body?: any) => {
    try {
      return await axios({ method, url: `${PRIMARY_API}${endpoint}`, data: body });
    } catch {
      return await axios({ method, url: `${FALLBACK_API}${endpoint}`, data: body });
    }
  };

  useEffect(() => {
    apiRequest('get', '/get/region')
      .then(res => {
        const lista = res.data.regiones || res.data;
        setRegiones(lista);
      })
      .catch(err => console.error('Error al cargar regiones:', err));
  }, []);

  useEffect(() => {
    if (id) {
      apiRequest('get', `/get/ciudad/${id}`)
        .then(res => {
          const c = res.data;
          setNuevaCiudad({
            ciudad_nombre: c.ciudad_nombre || '',
            ciudad_key: c.ciudad_key || c.ciudad_id,
            region_key: c.region_key || ''
          });
          setEditando(true);
        })
        .catch(err => console.error('Error al obtener ciudad:', err));
    } else {
      setEditando(false);
    }
  }, [id]);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevaCiudad(prev => ({ ...prev, [name]: value }));
  };

  const crearCiudad = () => {
    const { ciudad_nombre, region_key } = nuevaCiudad;
    if (!ciudad_nombre || !region_key) return;

    const payload = { ciudad_nombre, region_key };

    apiRequest('post', '/post/ciudad', payload)
      .then(() => setNuevaCiudad({ ciudad_nombre: '', ciudad_key: '', region_key: '' }))
      .catch(err => console.error('Error al crear ciudad:', err));
  };

  const actualizarCiudad = () => {
    const { ciudad_nombre, ciudad_key, region_key } = nuevaCiudad;
    if (!ciudad_key) return;

    const payload = { ciudad_nombre, region_key };

    apiRequest('put', `/put/ciudad/${ciudad_key}`, payload)
      .then(() => {
        setEditando(false);
        navigate('/lista-ciudades');
      })
      .catch(err => console.error('Error al actualizar ciudad:', err));
  };

  const obtenerCiudadPorId = () => {
    if (!busquedaId) return;

    apiRequest('get', `/get/ciudad/${busquedaId}`)
      .then(res => {
        const c = res.data;
        setNuevaCiudad({
          ciudad_nombre: c.ciudad_nombre,
          ciudad_key: c.ciudad_key || c.ciudad_id,
          region_key: c.region_key || ''
        });
        setEditando(true);
      })
      .catch(err => console.error('Ciudad no encontrada:', err));
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setNuevaCiudad({ ciudad_nombre: '', ciudad_key: '', region_key: '' });
    navigate('/lista-ciudades');
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
        <button onClick={obtenerCiudadPorId}>Buscar</button>
      </div>

      <div className="formulario">
        <input
          name="ciudad_nombre"
          placeholder="Nombre"
          value={nuevaCiudad.ciudad_nombre}
          onChange={manejarCambio}
        />

        {!editando && (
          <select
            name="region_key"
            value={nuevaCiudad.region_key}
            onChange={manejarCambio}
          >
            <option value="">-- Selecciona una región --</option>
            {regiones.map(region => (
              <option key={region.region_key} value={region.region_key}>
                {region.region_nombre}
              </option>
            ))}
          </select>
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
