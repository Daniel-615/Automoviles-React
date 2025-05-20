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
  const { id } = useParams(); // Para edición desde URL

  const [nuevoCliente, setNuevoCliente] = useState<Omit<Cliente, 'cliente_key' | 'fecha_registro'>>({
    cliente_id: '', nombre: '', apellido: '', email: '', telefono: '', ciudad: ''
  });

  const [editando, setEditando] = useState<Cliente | null>(null);
  const [busquedaId, setBusquedaId] = useState('');
  const [ciudades, setCiudades] = useState<{ ciudad_key: string; ciudad_nombre: string }[]>([]);

  useEffect(() => {
    // Cargar ciudades para el combobox
    axiosWithFallback('get', '/get/ciudad')
      .then(res => {
        const datos = res.data.ciudades || res.data;
        setCiudades(datos);
      })
      .catch(err => console.error('Error al cargar ciudades:', err));
  }, []);

  useEffect(() => {
    if (id) {
      axiosWithFallback('get', `/get/cliente/${id}`)
        .then(res => {
          const c = res.data;
          setNuevoCliente({
            cliente_id: c.cliente_id,
            nombre: c.nombre,
            apellido: c.apellido,
            email: c.email,
            telefono: c.telefono,
            ciudad: c.ciudad
          });
          setEditando(c);
        })
        .catch(err => console.error('Error al cargar cliente para edición:', err));
    }
  }, [id]);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoCliente({ ...nuevoCliente, [name]: value });
  };

  const crearCliente = () => {
    const { cliente_id, nombre, apellido, email, telefono, ciudad } = nuevoCliente;
    if (!cliente_id || !nombre || !apellido || !email || !telefono || !ciudad) return;

    axiosWithFallback('post', '/post/cliente', {
      cliente_id, cliente_nombre: nombre, cliente_apellido: apellido,
      cliente_gmail: email, cliente_telefono: telefono, ciudad_id: ciudad
    }).then(() => cancelarEdicion())
      .catch(err => console.error('Error al crear cliente:', err));
  };

  const actualizarCliente = () => {
    if (!editando?.cliente_key) return;

    axiosWithFallback('put', `/put/cliente/${editando.cliente_key}`, {
      cliente_gmail: nuevoCliente.email,
      cliente_telefono: nuevoCliente.telefono,
      cliente_ciudad: nuevoCliente.ciudad,
      cliente_region: ''
    }).then(() => cancelarEdicion())
      .catch(err => console.error('Error al actualizar cliente:', err));
  };

  const buscarClientePorId = () => {
    if (!busquedaId) return;

    axiosWithFallback('get', `/get/cliente/${busquedaId}`)
      .then(res => {
        const c = res.data;
        setNuevoCliente({
          cliente_id: c.cliente_id,
          nombre: c.nombre,
          apellido: c.apellido,
          email: c.email,
          telefono: c.telefono,
          ciudad: c.ciudad
        });
        setEditando(c);
      })
      .catch(err => console.error('Cliente no encontrado:', err));
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevoCliente({ cliente_id: '', nombre: '', apellido: '', email: '', telefono: '', ciudad: '' });
    navigate('/clientes');
  };

  return (
    <div className="cliente-container">
      <h2>Gestión de Clientes</h2>

      <div className="form-busqueda">
        <input
          type="text"
          placeholder="Buscar cliente por ID"
          value={busquedaId}
          onChange={(e) => setBusquedaId(e.target.value)}
        />
        <button onClick={buscarClientePorId}>Buscar</button>
      </div>

      <div className="formulario">
        <input type="text" name="cliente_id" placeholder="ID" value={nuevoCliente.cliente_id} onChange={manejarCambio} disabled={!!editando} />
        <input type="text" name="nombre" placeholder="Nombre" value={nuevoCliente.nombre} onChange={manejarCambio} />
        <input type="text" name="apellido" placeholder="Apellido" value={nuevoCliente.apellido} onChange={manejarCambio} />
        <input type="email" name="email" placeholder="Email" value={nuevoCliente.email} onChange={manejarCambio} />
        <input type="text" name="telefono" placeholder="Teléfono" value={nuevoCliente.telefono} onChange={manejarCambio} />
        
        {/* Combobox para ciudad */}
        <select name="ciudad" value={nuevoCliente.ciudad} onChange={manejarCambio}>
          <option value="">Seleccione una ciudad</option>
          {ciudades.map(ciudad => (
            <option key={ciudad.ciudad_key} value={ciudad.ciudad_key}>
              {ciudad.ciudad_nombre}
            </option>
          ))}
        </select>

        {editando ? (
          <>
            <button onClick={actualizarCliente}>Actualizar</button>
            <button onClick={cancelarEdicion} className="btn-cancelar">Cancelar</button>
          </>
        ) : (
          <button onClick={crearCliente}>Crear</button>
        )}
      </div>

      <div className="mostrar-clientes">
        <button onClick={() => navigate('/clientes')}>Ir al listado</button>
      </div>
    </div>
  );
};

export default Cliente;
