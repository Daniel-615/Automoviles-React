import React, { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../../components/css/vendedor_tienda.css';

const PRIMARY_API = 'https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas';
const FALLBACK_API = 'http://127.0.0.1:5000/ventas';

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

interface Opcion {
  key: string;
  nombre: string;
}

const VendedorTienda: React.FC = () => {
  const [registros, setRegistros] = useState<VendedorTienda[]>([]);
  const [registroActual, setRegistroActual] = useState<Omit<VendedorTienda, 'activo'>>({ vendedor_key: '', tienda_key: '' });
  const [editando, setEditando] = useState<boolean>(false);
  const [busquedaId, setBusquedaId] = useState('');
  const [vendedores, setVendedores] = useState<Opcion[]>([]);
  const [tiendas, setTiendas] = useState<Opcion[]>([]);
  const { id } = useParams();
  const navigate = useNavigate();

  const obtenerRegistros = () => {
    axiosWithFallback('get', '/vendedor/tienda/get')
      .then(res => setRegistros(res.data.vendedor_tienda || []))
      .catch(console.error);
  };

  const obtenerVendedores = () => {
    axiosWithFallback('get', '/get/vendedor')
      .then(res => {
        const data = res.data.vendedores || [];
        setVendedores(data.map((v: any) => ({ key: v.vendedor_key, nombre: v.nombre })));
      })
      .catch(console.error);
  };

  const obtenerTiendas = () => {
    axiosWithFallback('get', '/get/tienda')
      .then(res => {
        const data = res.data.tiendas || [];
        setTiendas(data.map((t: any) => ({ key: t.tienda_key, nombre: t.nombre_tienda })));
      })
      .catch(console.error);
  };

  useEffect(() => {
    obtenerRegistros();
    obtenerVendedores();
    obtenerTiendas();

    if (id) {
      axiosWithFallback('get', `/vendedor/tienda/get/${id}`)
        .then(res => {
          const r = res.data;
          setRegistroActual({
            id: r.id,
            vendedor_key: r.vendedor_key,
            tienda_key: r.tienda_key,
            fecha_renuncia: r.fecha_renuncia || ''
          });
          setEditando(true);
        })
        .catch(console.error);
    }
  }, [id]);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRegistroActual(prev => ({ ...prev, [name]: value }));
  };

  const crearRegistro = () => {
    if (!registroActual.vendedor_key || !registroActual.tienda_key) return;

    axiosWithFallback('post', '/vendedor/tienda/post', registroActual)
      .then(() => {
        obtenerRegistros();
        setRegistroActual({ vendedor_key: '', tienda_key: '' });
      })
      .catch(console.error);
  };

  const actualizarRegistro = () => {
    if (!registroActual.id || !registroActual.fecha_renuncia) return;

    axiosWithFallback('put', `/vendedor/tienda/put/${registroActual.id}`, {
      fecha_renuncia: registroActual.fecha_renuncia
    })
      .then(() => {
        obtenerRegistros();
        cancelarEdicion();
      })
      .catch(console.error);
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setRegistroActual({ vendedor_key: '', tienda_key: '', fecha_renuncia: '' });
    navigate('/lista-vendedor-tienda');
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
        <button onClick={() => navigate(`/vendedor-tienda/${busquedaId}`)}>Buscar</button>
        <button onClick={() => navigate('/lista-vendedor-tienda')}>Ver Lista</button>
      </div>

      <div className="formulario">
        <select
          name="vendedor_key"
          value={registroActual.vendedor_key}
          onChange={manejarCambio}
          disabled={editando}
        >
          <option value="">Selecciona un vendedor</option>
          {vendedores.map(v => (
            <option key={v.key} value={v.key}>{v.nombre}</option>
          ))}
        </select>

        <select
          name="tienda_key"
          value={registroActual.tienda_key}
          onChange={manejarCambio}
          disabled={editando}
        >
          <option value="">Selecciona una tienda</option>
          {tiendas.map(t => (
            <option key={t.key} value={t.key}>{t.nombre}</option>
          ))}
        </select>

        {editando && (
          <input
            type="date"
            name="fecha_renuncia"
            value={registroActual.fecha_renuncia || ''}
            onChange={manejarCambio}
          />
        )}

        {editando ? (
          <>
            <button onClick={actualizarRegistro}>Actualizar</button>
            <button onClick={cancelarEdicion} className="btn-cancelar">Cancelar</button>
          </>
        ) : (
          <button onClick={crearRegistro}>Crear</button>
        )}
      </div>

      <div className="tabla-registros">
        <h3>Registros existentes</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Vendedor</th>
              <th>Tienda</th>
              <th>Fecha de Renuncia</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((r, i) => (
              <tr key={r.id || i}>
                <td>{r.id}</td>
                <td>{r.vendedor_key}</td>
                <td>{r.tienda_key}</td>
                <td>{r.fecha_renuncia || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendedorTienda;