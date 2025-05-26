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
  const [nuevoSegmento, setNuevoSegmento] = useState<Omit<Segmento, 'segmento_key'>>({ 
    segmento_id: '', 
    nombre: '' 
  });
  const [editando, setEditando] = useState<string | null>(null);
  const [busquedaId, setBusquedaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      cargarSegmentoParaEdicion(id);
    }
  }, [id]);

  const cargarSegmentoParaEdicion = async (segmentoId: string) => {
    try {
      setLoading(true);
      const res = await hacerPeticion({ 
        method: 'GET', 
        url: `{BASE_URL}/get/segmento/${segmentoId}` 
      });
      const data = res.data;
      setEditando(data.segmento_key);
      setNuevoSegmento({ 
        segmento_id: data.segmento_id, 
        nombre: data.nombre 
      });
    } catch (err: any) {
      console.error('Error al obtener segmento:', err);
      setError(err.response?.data?.message || 'Error al cargar el segmento');
    } finally {
      setLoading(false);
    }
  };

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoSegmento(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validarFormulario = () => {
    if (!nuevoSegmento.segmento_id.trim()) {
      setError('El ID del segmento es requerido');
      return false;
    }
    if (!nuevoSegmento.nombre.trim()) {
      setError('El nombre del segmento es requerido');
      return false;
    }
    return true;
  };

  const crearSegmento = async () => {
    if (!validarFormulario()) return;

    try {
      setLoading(true);
      await hacerPeticion({ 
        method: 'POST', 
        url: `{BASE_URL}/post/segmento`, 
        data: nuevoSegmento 
      });
      setNuevoSegmento({ segmento_id: '', nombre: '' });
      setError('');
      alert('Segmento creado exitosamente');
    } catch (err: any) {
      console.error('Error al crear segmento:', err);
      setError(err.response?.data?.message || 'Error al crear el segmento');
    } finally {
      setLoading(false);
    }
  };

  const actualizarSegmento = async () => {
    if (!editando) return;
    if (!nuevoSegmento.nombre.trim()) {
      setError('El nombre del segmento es requerido');
      return;
    }

    try {
      setLoading(true);
      await hacerPeticion({
        method: 'PUT',
        url: `{BASE_URL}/put/segmento/${editando}`,
        data: { nombre: nuevoSegmento.nombre }
      });
      alert('Segmento actualizado exitosamente');
      cancelarEdicion();
    } catch (err: any) {
      console.error('Error al actualizar segmento:', err);
      setError(err.response?.data?.message || 'Error al actualizar el segmento');
    } finally {
      setLoading(false);
    }
  };

  const buscarSegmentoPorId = async () => {
    if (!busquedaId.trim()) {
      setError('Ingrese un ID para buscar');
      return;
    }

    try {
      setLoading(true);
      await cargarSegmentoParaEdicion(busquedaId);
      setBusquedaId('');
    } catch (err) {
      // El error ya se maneja en cargarSegmentoParaEdicion
    }
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevoSegmento({ segmento_id: '', nombre: '' });
    setError('');
    navigate('/lista-segmentos');
  };

  if (loading) {
    return (
      <div className="segmento-container">
        <h2>Cargando...</h2>
      </div>
    );
  }

  return (
    <div className="segmento-container">
      <h2>Gestión de Segmentos</h2>

      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1rem' 
        }}>
          {error}
        </div>
      )}

      <div className="form-busqueda">
        <input
          type="text"
          placeholder="Buscar segmento por ID"
          value={busquedaId}
          onChange={(e) => setBusquedaId(e.target.value)}
        />
        <button onClick={buscarSegmentoPorId} disabled={loading}>
          Buscar
        </button>
      </div>

      <div className="formulario">
        <input
          type="text"
          name="segmento_id"
          placeholder="ID del Segmento"
          value={nuevoSegmento.segmento_id}
          onChange={manejarCambio}
          disabled={!!editando || loading}
        />
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del Segmento"
          value={nuevoSegmento.nombre}
          onChange={manejarCambio}
          disabled={loading}
        />
        {editando ? (
          <>
            <button onClick={actualizarSegmento} disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
            <button onClick={cancelarEdicion} className="btn-cancelar" disabled={loading}>
              Cancelar
            </button>
          </>
        ) : (
          <button onClick={crearSegmento} disabled={loading}>
            {loading ? 'Creando...' : 'Crear'}
          </button>
        )}
      </div>

      <div className="mostrar-listado">
        <button onClick={() => navigate('/lista-segmentos')}>
          Ir al listado de segmentos
        </button>
      </div>
    </div>
  );
};

export default Segmento;