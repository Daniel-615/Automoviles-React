import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../components/css/ListaClientes.css';

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

const PRIMARY_API = 'https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas';
const FALLBACK_API = 'http://localhost:5000/ventas';

const apiRequest = async (method: 'get', endpoint: string) => {
  try {
    return await axios({ method, url: `${PRIMARY_API}${endpoint}` });
  } catch {
    return await axios({ method, url: `${FALLBACK_API}${endpoint}` });
  }
};

const ListaClientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
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
  }, []);

  return (
    <div className="lista-container">
      <div className="lista-header">
        <h1>Listado de Clientes</h1>
        <button className="btn-volver" onClick={() => navigate('/cliente')}>
          ← Volver a Gestión
        </button>
      </div>

      {clientes.length === 0 ? (
        <p className="mensaje-vacio">No hay clientes registrados.</p>
      ) : (
        <div className="tarjetas-vendedores">
          {clientes.map((c) => (
            <div className="tarjeta" key={c.cliente_key}>
              <h3>{c.nombre} {c.apellido}</h3>
              <p><strong>ID:</strong> {c.cliente_id}</p>
              <p><strong>Email:</strong> {c.email}</p>
              <p><strong>Teléfono:</strong> {c.telefono}</p>
              <p><strong>Ciudad:</strong> {c.ciudad}</p>
              <p><strong>Registrado:</strong> {c.fecha_registro?.split('T')[0]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaClientes;
