import React, { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';
import '../../components/css/vendedor_tienda.css';

const PRIMARY_API = 'https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas/vendedor/tienda';
const FALLBACK_API = 'http://127.0.0.1:5000/ventas/vendedor/tienda';

const axiosWithFallback = async (method: 'get' | 'post' | 'put', path: string, data?: any) => {
  try {
    return await axios({ method, url: `${PRIMARY_API}${path}`, data });
  } catch {
    return await axios({ method, url: `${FALLBACK_API}${path}`, data });
  }
};

interface VendedorTienda {
  id?: string;
  vendedor_key: string;
  tienda_key: string;
  fecha_renuncia?: string;
  activo?: boolean;
}

const VendedorTienda: React.FC = () => {
  const [registros, setRegistros] = useState<VendedorTienda[]>([]);
  const [nuevoRegistro, setNuevoRegistro] = useState<Omit<VendedorTienda, 'id' | 'activo'>>({
    vendedor_key: '',
    tienda_key: ''
  });
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [busquedaId, setBusquedaId] = useState('');

  const obtenerRegistros = () => {
    axiosWithFallback('get', '/get')
      .then(res => setRegistros(res.data.vendedor_tienda || []))
      .catch(console.error);
  };

  useEffect(() => {
    obtenerRegistros();
  }, []);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoRegistro(prev => ({ ...prev, [name]: value }));
  };

  const crearRegistro = () => {
    if (!nuevoRegistro.vendedor_key || !nuevoRegistro.tienda_key) return;

    axiosWithFallback('post', '/post', nuevoRegistro)
      .then(() => {
        obtenerRegistros();
        setNuevoRegistro({ vendedor_key: '', tienda_key: '' });
      })
      .catch(console.error);
  };

  const actualizarRegistro = () => {
    if (!editandoId || !nuevoRegistro.fecha_renuncia) return;

    axiosWithFallback('put', `/put/${editandoId}`, {
      fecha_renuncia: nuevoRegistro.fecha_renuncia
    })
      .then(() => {
        obtenerRegistros();
        cancelarEdicion();
      })
      .catch(console.error);
  };

  const buscarPorId = () => {
    if (!busquedaId) return;

    axiosWithFallback('get', `/get/${busquedaId}`)
      .then(res => console.log(res.data))
      .catch(console.error);
  };

  const iniciarEdicion = (registro: VendedorTienda) => {
    setEditandoId(registro.id!);
    setNuevoRegistro({ ...registro });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNuevoRegistro({ vendedor_key: '', tienda_key: '' });
  };

  return (
    <div className="vendedor-tienda-container">
      <h2>Gestión de Vendedor-Tienda</h2>

      <div className="form-busqueda">
        <input
          type="text"
          placeholder="Buscar por ID"
          value={busquedaId}
          onChange={(e) => setBusquedaId(e.target.value)}
        />
        <button onClick={buscarPorId}>Buscar</button>
      </div>

      <div className="formulario">
        <input
          type="text"
          name="vendedor_key"
          placeholder="ID Vendedor"
          value={nuevoRegistro.vendedor_key}
          onChange={manejarCambio}
          disabled={!!editandoId}
        />
        <input
          type="text"
          name="tienda_key"
          placeholder="ID Tienda"
          value={nuevoRegistro.tienda_key}
          onChange={manejarCambio}
          disabled={!!editandoId}
        />
        {editandoId && (
          <input
            type="date"
            name="fecha_renuncia"
            value={nuevoRegistro.fecha_renuncia || ''}
            onChange={manejarCambio}
          />
        )}
        {editandoId ? (
          <>
            <button onClick={actualizarRegistro}>Actualizar</button>
            <button onClick={cancelarEdicion} className="btn-cancelar">Cancelar</button>
          </>
        ) : (
          <button onClick={crearRegistro}>Crear</button>
        )}
      </div>

      <ul className="lista-registros">
        {registros.map((r, i) => (
          <li key={i}>
            <div>
              <strong>Vendedor:</strong> {r.vendedor_key} - <strong>Tienda:</strong> {r.tienda_key} - <strong>Activo:</strong> {r.activo ? 'Sí' : 'No'}
            </div>
            <button onClick={() => iniciarEdicion(r)}>Editar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VendedorTienda;
