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
  const [registroActual, setRegistroActual] = useState<Omit<VendedorTienda, 'activo'>>({ 
    vendedor_key: '', 
    tienda_key: '',
    fecha_renuncia: ''
  });
  const [editando, setEditando] = useState<boolean>(false);
  const [busquedaId, setBusquedaId] = useState('');
  const [vendedores, setVendedores] = useState<Opcion[]>([]);
  const [tiendas, setTiendas] = useState<Opcion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    if (id) {
      cargarRegistroParaEdicion(id);
    }
  }, [id]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      
      const [registrosRes, vendedoresRes, tiendasRes] = await Promise.all([
        axiosWithFallback('get', '/vendedor/tienda/get'),
        axiosWithFallback('get', '/get/vendedor'),
        axiosWithFallback('get', '/get/tienda')
      ]);

      setRegistros(registrosRes.data.vendedor_tienda || []);
      
      const vendedoresData = vendedoresRes.data.vendedores || [];
      setVendedores(vendedoresData.map((v: any) => ({
        key: v.vendedor_key,
        nombre: v.nombre
      })));

      const tiendasData = tiendasRes.data.tiendas || [];
      setTiendas(tiendasData.map((t: any) => ({
        key: t.tienda_key,
        nombre: t.nombre_tienda
      })));
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const cargarRegistroParaEdicion = async (registroId: string) => {
    try {
      setLoading(true);
      const res = await axiosWithFallback('get', `/vendedor/tienda/get/${registroId}`);
      const r = res.data;
      setRegistroActual({
        id: r.id,
        vendedor_key: r.vendedor_key,
        tienda_key: r.tienda_key,
        fecha_renuncia: r.fecha_renuncia || ''
      });
      setEditando(true);
    } catch (err: any) {
      console.error('Error al cargar registro:', err);
      setError(err.response?.data?.message || 'Error al cargar el registro');
    } finally {
      setLoading(false);
    }
  };

  const manejarCambio = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRegistroActual(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validarFormulario = () => {
    if (!registroActual.vendedor_key) {
      setError('Debe seleccionar un vendedor');
      return false;
    }
    if (!registroActual.tienda_key) {
      setError('Debe seleccionar una tienda');
      return false;
    }
    return true;
  };

  const crearRegistro = async () => {
    if (!validarFormulario()) return;

    try {
      setLoading(true);
      await axiosWithFallback('post', '/vendedor/tienda/post', {
        vendedor_key: registroActual.vendedor_key,
        tienda_key: registroActual.tienda_key
      });
      
      await cargarDatosIniciales(); // Recargar la lista
      setRegistroActual({ vendedor_key: '', tienda_key: '', fecha_renuncia: '' });
      setError('');
      alert('Relación vendedor-tienda creada exitosamente');
    } catch (err: any) {
      console.error('Error al crear registro:', err);
      setError(err.response?.data?.message || 'Error al crear la relación');
    } finally {
      setLoading(false);
    }
  };

  const actualizarRegistro = async () => {
    if (!registroActual.id || !registroActual.fecha_renuncia) {
      setError('La fecha de renuncia es requerida para actualizar');
      return;
    }

    try {
      setLoading(true);
      await axiosWithFallback('put', `/vendedor/tienda/put/${registroActual.id}`, {
        fecha_renuncia: registroActual.fecha_renuncia
      });
      
      alert('Registro actualizado exitosamente');
      cancelarEdicion();
    } catch (err: any) {
      console.error('Error al actualizar registro:', err);
      setError(err.response?.data?.message || 'Error al actualizar el registro');
    } finally {
      setLoading(false);
    }
  };

  const buscarRegistroPorId = async () => {
    if (!busquedaId.trim()) {
      setError('Ingrese un ID para buscar');
      return;
    }

    try {
      await cargarRegistroParaEdicion(busquedaId);
      setBusquedaId('');
    } catch (err) {
      // El error ya se maneja en cargarRegistroParaEdicion
    }
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setRegistroActual({ vendedor_key: '', tienda_key: '', fecha_renuncia: '' });
    setError('');
    navigate('/lista-vendedor-tienda');
  };

  const obtenerNombreVendedor = (key: string) => {
    const vendedor = vendedores.find(v => v.key === key);
    return vendedor ? vendedor.nombre : key;
  };

  const obtenerNombreTienda = (key: string) => {
    const tienda = tiendas.find(t => t.key === key);
    return tienda ? tienda.nombre : key;
  };

  if (loading) {
    return (
      <div className="vendedor-tienda-container">
        <h2>Cargando...</h2>
      </div>
    );
  }

  return (
    <div className="vendedor-tienda-container">
      <h2>Gestión de Vendedor-Tienda</h2>

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
          placeholder="Buscar por ID"
          value={busquedaId}
          onChange={(e) => setBusquedaId(e.target.value)}
        />
        <button onClick={buscarRegistroPorId} disabled={loading}>
          Buscar
        </button>
        <button onClick={() => navigate('/lista-vendedor-tienda')}>
          Ver Lista
        </button>
      </div>

      <div className="formulario">
        <select
          name="vendedor_key"
          value={registroActual.vendedor_key}
          onChange={manejarCambio}
          disabled={editando || loading}
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
          disabled={editando || loading}
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
            disabled={loading}
          />
        )}

        {editando ? (
          <>
            <button onClick={actualizarRegistro} disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
            <button onClick={cancelarEdicion} className="btn-cancelar" disabled={loading}>
              Cancelar
            </button>
          </>
        ) : (
          <button onClick={crearRegistro} disabled={loading}>
            {loading ? 'Creando...' : 'Crear'}
          </button>
        )}
      </div>

      <div className="tabla-registros">
        <h3>Registros existentes ({registros.length})</h3>
        {registros.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>ID</th>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Vendedor</th>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Tienda</th>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Estado</th>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Fecha Renuncia</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r, i) => (
                  <tr key={r.id || i} style={{ cursor: 'pointer' }} onClick={() => navigate(`/vendedor-tienda/${r.id}`)}>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{r.id}</td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{obtenerNombreVendedor(r.vendedor_key)}</td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{obtenerNombreTienda(r.tienda_key)}</td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                      <span style={{ 
                        color: r.activo !== false ? 'green' : 'red',
                        fontWeight: 'bold'
                      }}>
                        {r.activo !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{r.fecha_renuncia || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No hay registros disponibles</p>
        )}
      </div>
    </div>
  );
};

export default VendedorTienda;