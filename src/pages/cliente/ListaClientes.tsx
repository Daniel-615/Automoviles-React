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

const apiRequest = async (method: 'get', endpoint: string, params?: any) => {
  try {
    return await axios({ method, url: `${PRIMARY_API}${endpoint}`, params });
  } catch {
    return await axios({ method, url: `${FALLBACK_API}${endpoint}`, params });
  }
};

const ListaClientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const cargarClientes = async (pagina: number = 1) => {
    try {
      setLoading(true);
      const res = await apiRequest('get', '/get/cliente', { 
        page: pagina, 
        per_page: 12 
      });
      
      if (res.data.clientes) {
        const formateados = res.data.clientes.map((c: any) => ({
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
        setTotal(res.data.total || formateados.length);
        setTotalPaginas(res.data.total_paginas || 1);
        setPaginaActual(res.data.pagina_actual || pagina);
      } else {
        // Si no hay estructura de paginación, usar datos directos
        const datos = Array.isArray(res.data) ? res.data : [];
        setClientes(datos);
        setTotal(datos.length);
        setTotalPaginas(1);
        setPaginaActual(1);
      }
      setError('');
    } catch (err: any) {
      console.error('Error al obtener clientes:', err);
      setError(err.response?.data?.message || 'Error al cargar los clientes');
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      cargarClientes(nuevaPagina);
    }
  };

  if (loading) {
    return (
      <div className="lista-container">
        <h1>Cargando clientes...</h1>
      </div>
    );
  }

  return (
    <div className="lista-container">
      <div className="lista-header">
        <h1>Listado de Clientes</h1>
        <button className="btn-volver" onClick={() => navigate('/cliente')}>
          ← Volver a Gestión
        </button>
      </div>

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

      {clientes.length === 0 ? (
        <p className="mensaje-vacio">No hay clientes registrados.</p>
      ) : (
        <>
          <div style={{ marginBottom: '1rem', color: '#666' }}>
            Mostrando {clientes.length} de {total} clientes
            {totalPaginas > 1 && ` - Página ${paginaActual} de ${totalPaginas}`}
          </div>
          
          <div className="tarjetas-vendedores">
            {clientes.map((c) => (
              <div
                className="tarjeta"
                key={c.cliente_key}
                onClick={() => navigate(`/cliente/${c.cliente_key}`)}
                style={{ cursor: 'pointer' }}
              >
                <h3>{c.nombre} {c.apellido}</h3>
                <p><strong>ID:</strong> {c.cliente_id}</p>
                <p><strong>Email:</strong> {c.email}</p>
                <p><strong>Teléfono:</strong> {c.telefono}</p>
                <p><strong>Ciudad:</strong> {c.ciudad}</p>
                {c.fecha_registro && (
                  <p><strong>Registrado:</strong> {c.fecha_registro.split('T')[0]}</p>
                )}
              </div>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              marginTop: '2rem',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual <= 1}
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: paginaActual <= 1 ? '#ccc' : '#1565c0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: paginaActual <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                ← Anterior
              </button>
              
              <span style={{ 
                padding: '0.5rem 1rem',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center'
              }}>
                {paginaActual} / {totalPaginas}
              </span>
              
              <button 
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual >= totalPaginas}
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: paginaActual >= totalPaginas ? '#ccc' : '#1565c0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: paginaActual >= totalPaginas ? 'not-allowed' : 'pointer'
                }}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListaClientes;