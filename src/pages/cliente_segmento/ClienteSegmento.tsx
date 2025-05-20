// ============================ ClienteSegmento.tsx ============================
import React, { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../../components/css/cliente_segmento.css';

const PRIMARY_API = 'https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas';
const FALLBACK_API = 'http://localhost:5000/ventas';

interface ClienteSegmento {
  cliente_segmento_key?: string;
  cliente_key: string;
  segmento_key: string;
}

const ClienteSegmento: React.FC = () => {
  const [nuevaRelacion, setNuevaRelacion] = useState<Omit<ClienteSegmento, 'cliente_segmento_key'>>({
    cliente_key: '', segmento_key: ''
  });
  const [editando, setEditando] = useState<ClienteSegmento | null>(null);
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
      apiRequest('get', `/get/cliente_segmento/${id}`)
        .then(res => {
          const rel = res.data;
          setNuevaRelacion({
            cliente_key: rel.cliente_key,
            segmento_key: rel.segmento_key
          });
          setEditando(rel);
        })
        .catch(console.error);
    }
  }, [id]);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevaRelacion(prev => ({ ...prev, [name]: value }));
  };

  const crearRelacion = () => {
    if (!nuevaRelacion.cliente_key || !nuevaRelacion.segmento_key) return;

    apiRequest('post', '/post/cliente_segmento', nuevaRelacion)
      .then(() => {
        setNuevaRelacion({ cliente_key: '', segmento_key: '' });
      })
      .catch(console.error);
  };

  const actualizarRelacion = () => {
    if (!editando?.cliente_segmento_key) return;

    apiRequest('put', `/put/cliente_segmento/${editando.cliente_segmento_key}`, {
      segmento_key: nuevaRelacion.segmento_key
    })
      .then(() => cancelarEdicion())
      .catch(console.error);
  };

  const buscarRelacionPorId = () => {
    if (!busquedaId) return;

    apiRequest('get', `/get/cliente_segmento/${busquedaId}`)
      .then(res => {
        const rel = res.data;
        setNuevaRelacion({ cliente_key: rel.cliente_key, segmento_key: rel.segmento_key });
        setEditando(rel);
      })
      .catch(console.error);
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevaRelacion({ cliente_key: '', segmento_key: '' });
    navigate('/lista-cliente-segmento');
  };

  return (
    <div className="relacion-container">
      <h2>Relación Cliente - Segmento</h2>

      <div className="form-busqueda">
        <input
          type="text"
          placeholder="Buscar por ID"
          value={busquedaId}
          onChange={(e) => setBusquedaId(e.target.value)}
        />
        <button onClick={buscarRelacionPorId}>Buscar</button>
        <button onClick={() => navigate('/lista-cliente-segmento')}>Ver Lista</button>
      </div>

      <div className="formulario">
        <input
          type="text"
          name="cliente_key"
          placeholder="UUID Cliente"
          value={nuevaRelacion.cliente_key}
          onChange={manejarCambio}
          disabled={!!editando}
        />
        <input
          type="text"
          name="segmento_key"
          placeholder="UUID Segmento"
          value={nuevaRelacion.segmento_key}
          onChange={manejarCambio}
        />
        {editando ? (
          <>
            <button onClick={actualizarRelacion}>Actualizar</button>
            <button onClick={cancelarEdicion} className="btn-cancelar">Cancelar</button>
          </>
        ) : (
          <button onClick={crearRelacion}>Crear</button>
        )}
      </div>
    </div>
  );
};

export default ClienteSegmento;