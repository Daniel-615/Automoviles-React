import React, { useState, ChangeEvent, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../../components/css/Cliente.css';

const PRIMARY_API = 'https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas';
const FALLBACK_API = 'http://localhost:5000/ventas';

const axiosWithFallback = async (method: 'get' | 'post' | 'put', path: string, data?: any) => {
  try {
    return await axios({ method, url: `${PRIMARY_API}${path}`, data });
  } catch {
    return await axios({ method, url: `${FALLBACK_API}${path}`, data });
  }
};

export interface Cliente {
  cliente_key: string;
  cliente_id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  ciudad: string;
  fecha_registro?: string;
}

const Cliente: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nuevoCliente, setNuevoCliente] = useState({
    cliente_id: '',
    cliente_nombre: '',
    cliente_apellido: '',
    cliente_gmail: '',
    cliente_telefono: '',
    ciudad_id: ''
  });

  const [editando, setEditando] = useState<Cliente | null>(null);
  const [busquedaId, setBusquedaId] = useState('');
  const [ciudades, setCiudades] = useState<{ ciudad_key: string; ciudad_nombre: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarCiudades();
  }, []);

  useEffect(() => {
    if (id) {
      cargarClienteParaEdicion(id);
    }
  }, [id]);

  const cargarCiudades = async () => {
    try {
      const res = await axiosWithFallback('get', '/get/ciudad');
      const datos = res.data.ciudades || res.data;
      setCiudades(datos);
    } catch (err) {
      console.error('Error al cargar ciudades:', err);
      setError('Error al cargar las ciudades');
    }
  };

  const cargarClienteParaEdicion = async (clienteId: string) => {
    try {
      setLoading(true);
      const res = await axiosWithFallback('get', `/get/cliente/${clienteId}`);
      const c = res.data;
      setNuevoCliente({
        cliente_id: c.cliente_id,
        cliente_nombre: c.nombre,
        cliente_apellido: c.apellido,
        cliente_gmail: c.email,
        cliente_telefono: c.telefono,
        ciudad_id: c.ciudad
      });
      setEditando(c);
    } catch (err: any) {
      console.error('Error al cargar cliente:', err);
      setError(err.response?.data?.message || 'Error al cargar el cliente');
    } finally {
      setLoading(false);
    }
  };

  const manejarCambio = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoCliente(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validarFormulario = () => {
    const { cliente_id, cliente_nombre, cliente_apellido, cliente_gmail, cliente_telefono, ciudad_id } = nuevoCliente;
    
    if (!cliente_id.trim()) {
      setError('El ID del cliente es requerido');
      return false;
    }
    if (!cliente_nombre.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!cliente_apellido.trim()) {
      setError('El apellido es requerido');
      return false;
    }
    if (!cliente_gmail.trim()) {
      setError('El email es requerido');
      return false;
    }
    if (!cliente_telefono.trim()) {
      setError('El teléfono es requerido');
      return false;
    }
    if (!ciudad_id) {
      setError('Debe seleccionar una ciudad');
      return false;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cliente_gmail)) {
      setError('El formato del email no es válido');
      return false;
    }

    return true;
  };

  const crearCliente = async () => {
    if (!validarFormulario()) return;

    try {
      setLoading(true);
      await axiosWithFallback('post', '/post/cliente', nuevoCliente);
      setNuevoCliente({
        cliente_id: '',
        cliente_nombre: '',
        cliente_apellido: '',
        cliente_gmail: '',
        cliente_telefono: '',
        ciudad_id: ''
      });
      setError('');
      alert('Cliente creado exitosamente');
    } catch (err: any) {
      console.error('Error al crear cliente:', err);
      setError(err.response?.data?.message || 'Error al crear el cliente');
    } finally {
      setLoading(false);
    }
  };

  const actualizarCliente = async () => {
    if (!editando?.cliente_key) return;
    if (!nuevoCliente.cliente_gmail || !nuevoCliente.cliente_telefono || !nuevoCliente.ciudad_id) {
      setError('Todos los campos son requeridos para actualizar');
      return;
    }

    try {
      setLoading(true);
      await axiosWithFallback('put', `/put/cliente/${editando.cliente_key}`, {
        cliente_gmail: nuevoCliente.cliente_gmail,
        cliente_telefono: nuevoCliente.cliente_telefono,
        cliente_ciudad: nuevoCliente.ciudad_id,
        cliente_region: '' // El backend requiere este campo
      });
      alert('Cliente actualizado exitosamente');
      cancelarEdicion();
    } catch (err: any) {
      console.error('Error al actualizar cliente:', err);
      setError(err.response?.data?.message || 'Error al actualizar el cliente');
    } finally {
      setLoading(false);
    }
  };

  const buscarClientePorId = async () => {
    if (!busquedaId.trim()) {
      setError('Ingrese un ID para buscar');
      return;
    }

    try {
      setLoading(true);
      await cargarClienteParaEdicion(busquedaId);
      setBusquedaId('');
    } catch (err) {
      // El error ya se maneja en cargarClienteParaEdicion
    }
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevoCliente({
      cliente_id: '',
      cliente_nombre: '',
      cliente_apellido: '',
      cliente_gmail: '',
      cliente_telefono: '',
      ciudad_id: ''
    });
    setError('');
    navigate('/clientes');
  };

  if (loading) {
    return (
      <div className="cliente-container">
        <h2>Cargando...</h2>
      </div>
    );
  }

  return (
    <div className="cliente-container">
      <h2>Gestión de Clientes</h2>

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
          placeholder="Buscar cliente por ID"
          value={busquedaId}
          onChange={(e) => setBusquedaId(e.target.value)}
        />
        <button onClick={buscarClientePorId} disabled={loading}>
          Buscar
        </button>
      </div>

      <div className="formulario">
        <input 
          type="text" 
          name="cliente_id" 
          placeholder="ID del Cliente" 
          value={nuevoCliente.cliente_id} 
          onChange={manejarCambio} 
          disabled={!!editando || loading} 
        />
        <input 
          type="text" 
          name="cliente_nombre" 
          placeholder="Nombre" 
          value={nuevoCliente.cliente_nombre} 
          onChange={manejarCambio}
          disabled={!!editando || loading}
        />
        <input 
          type="text" 
          name="cliente_apellido" 
          placeholder="Apellido" 
          value={nuevoCliente.cliente_apellido} 
          onChange={manejarCambio}
          disabled={!!editando || loading}
        />
        <input 
          type="email" 
          name="cliente_gmail" 
          placeholder="Email" 
          value={nuevoCliente.cliente_gmail} 
          onChange={manejarCambio}
          disabled={loading}
        />
        <input 
          type="text" 
          name="cliente_telefono" 
          placeholder="Teléfono" 
          value={nuevoCliente.cliente_telefono} 
          onChange={manejarCambio}
          disabled={loading}
        />
        
        <select 
          name="ciudad_id" 
          value={nuevoCliente.ciudad_id} 
          onChange={manejarCambio}
          disabled={loading}
        >
          <option value="">Seleccione una ciudad</option>
          {ciudades.map(ciudad => (
            <option key={ciudad.ciudad_key} value={ciudad.ciudad_key}>
              {ciudad.ciudad_nombre}
            </option>
          ))}
        </select>

        {editando ? (
          <>
            <button onClick={actualizarCliente} disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
            <button onClick={cancelarEdicion} className="btn-cancelar" disabled={loading}>
              Cancelar
            </button>
          </>
        ) : (
          <button onClick={crearCliente} disabled={loading}>
            {loading ? 'Creando...' : 'Crear'}
          </button>
        )}
      </div>

      <div className="mostrar-clientes">
        <button onClick={() => navigate('/clientes')}>Ir al listado</button>
      </div>
    </div>
  );
};

export default Cliente;