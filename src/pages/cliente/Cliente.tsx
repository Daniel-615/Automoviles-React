import React, { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';
import '../../components/css/cliente.css'; // Asegúrate que el archivo esté en la ruta correcta

const PRIMARY_API = 'https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas';
const FALLBACK_API = 'http://localhost:5000/ventas';

interface Cliente {
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
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nuevoCliente, setNuevoCliente] = useState<Omit<Cliente, 'cliente_key' | 'fecha_registro'>>({
    cliente_id: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    ciudad: ''
  });
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [busquedaId, setBusquedaId] = useState('');

  const apiRequest = async (method: 'get' | 'post' | 'put', endpoint: string, body?: any) => {
    try {
      return await axios({ method, url: `${PRIMARY_API}${endpoint}`, data: body });
    } catch {
      return await axios({ method, url: `${FALLBACK_API}${endpoint}`, data: body });
    }
  };

  const obtenerClientes = () => {
    apiRequest('get', '/get/cliente')
      .then(res => {
        const datos = res.data.clientes || res.data;
        const formateados = datos.map((c: any) => ({
          cliente_key: c.cliente_key,
          cliente_id: c.cliente_id,
          nombre: c.nombre,
          apellido: c.apellido,
          email: c.email,
          telefono: c.telefono,
          ciudad: c.ciudad,
          fecha_registro: c.fecha_registro
        }));
        setClientes(formateados);
      })
      .catch(err => console.error('Error al obtener clientes:', err));
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoCliente({ ...nuevoCliente, [name]: value });
  };

  const crearCliente = () => {
    const { cliente_id, nombre, apellido, email, telefono, ciudad } = nuevoCliente;
    if (!cliente_id || !nombre || !apellido || !email || !telefono || !ciudad) return;

    const payload = {
      cliente_id,
      cliente_nombre: nombre,
      cliente_apellido: apellido,
      cliente_gmail: email,
      cliente_telefono: telefono,
      ciudad_id: ciudad
    };

    apiRequest('post', '/post/cliente', payload)
      .then(() => {
        obtenerClientes();
        cancelarEdicion();
      })
      .catch(err => console.error('Error al crear cliente:', err));
  };

  const actualizarCliente = () => {
    if (!editando?.cliente_key) return;

    const payload = {
      cliente_gmail: nuevoCliente.email,
      cliente_telefono: nuevoCliente.telefono,
      cliente_ciudad: nuevoCliente.ciudad,
      cliente_region: ''
    };

    apiRequest('put', `/put/cliente/${editando.cliente_key}`, payload)
      .then(() => {
        obtenerClientes();
        cancelarEdicion();
      })
      .catch(err => console.error('Error al actualizar cliente:', err));
  };

  const iniciarEdicion = (cliente: Cliente) => {
    setEditando(cliente);
    setNuevoCliente({
      cliente_id: cliente.cliente_id,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      email: cliente.email,
      telefono: cliente.telefono,
      ciudad: cliente.ciudad
    });
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevoCliente({
      cliente_id: '',
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      ciudad: ''
    });
  };

  const buscarClientePorId = () => {
    if (!busquedaId) return;

    apiRequest('get', `/get/cliente/${busquedaId}`)
      .then(res => {
        const c = res.data;
        console.log('Cliente encontrado:', c.nombre, c.apellido);
      })
      .catch(err => console.error('Cliente no encontrado:', err));
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
        <input type="text" name="ciudad" placeholder="Ciudad (UUID)" value={nuevoCliente.ciudad} onChange={manejarCambio} />
        {editando ? (
          <>
            <button onClick={actualizarCliente}>Actualizar</button>
            <button onClick={cancelarEdicion} className="btn-cancelar">Cancelar</button>
          </>
        ) : (
          <button onClick={crearCliente}>Crear</button>
        )}
      </div>

      <ul className="lista-clientes">
        {clientes.map((c) => (
          <li key={c.cliente_key}>
            <strong>{c.nombre} {c.apellido}</strong> - {c.email}
            <button onClick={() => iniciarEdicion(c)}>Editar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Cliente;
