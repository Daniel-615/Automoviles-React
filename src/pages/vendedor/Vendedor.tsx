import React, { useEffect, useState, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../../components/css/vendedor.css';

const PRIMARY_API = 'https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas';
const FALLBACK_API = 'http://127.0.0.1:5000/ventas';

const axiosWithFallback = async (method: 'get' | 'post' | 'put', path: string, data?: any) => {
  try {
    return await axios({ method, url: `${PRIMARY_API}${path}`, data });
  } catch {
    return await axios({ method, url: `${FALLBACK_API}${path}`, data });
  }
};

export interface Vendedor {
  vendedor_key?: string;
  vendedor_id: string;
  nombre: string;
  edad: number;
  salario: number;
  activo?: boolean;
}

const Vendedor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [nuevoVendedor, setNuevoVendedor] = useState<Omit<Vendedor, 'vendedor_key' | 'activo'>>({
    vendedor_id: '', 
    nombre: '', 
    edad: 18, 
    salario: 3000
  });
  
  const [editando, setEditando] = useState<string | null>(null);
  const [busquedaId, setBusquedaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      cargarVendedorParaEdicion(id);
    }
  }, [id]);

  const cargarVendedorParaEdicion = async (vendedorId: string) => {
    try {
      setLoading(true);
      const res = await axiosWithFallback('get', `/get/vendedor/${vendedorId}`);
      const v = res.data;
      setNuevoVendedor({
        vendedor_id: v.vendedor_id,
        nombre: v.nombre,
        edad: v.edad,
        salario: v.salario
      });
      setEditando(v.vendedor_key || v.vendedor_id);
    } catch (err: any) {
      console.error('Error al cargar vendedor:', err);
      setError(err.response?.data?.message || 'Error al cargar el vendedor');
    } finally {
      setLoading(false);
    }
  };

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoVendedor(prev => ({
      ...prev,
      [name]: name === 'edad' || name === 'salario' ? parseFloat(value) || 0 : value
    }));
    setError('');
  };

  const validarFormulario = () => {
    const { vendedor_id, nombre, edad, salario } = nuevoVendedor;
    
    if (!vendedor_id.trim()) {
      setError('El ID del vendedor es requerido');
      return false;
    }
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!edad || edad < 18 || edad > 65) {
      setError('La edad debe estar entre 18 y 65 años');
      return false;
    }
    if (!salario || salario < 3000) {
      setError('El salario debe ser mayor o igual a 3000');
      return false;
    }

    return true;
  };

  const crearVendedor = async () => {
    if (!validarFormulario()) return;

    try {
      setLoading(true);
      await axiosWithFallback('post', '/post/vendedor', nuevoVendedor);
      setNuevoVendedor({ vendedor_id: '', nombre: '', edad: 18, salario: 3000 });
      setError('');
      alert('Vendedor creado exitosamente');
    } catch (err: any) {
      console.error('Error al crear vendedor:', err);
      setError(err.response?.data?.message || 'Error al crear el vendedor');
    } finally {
      setLoading(false);
    }
  };

  const actualizarVendedor = async () => {
    if (!editando) return;
    
    const { edad, salario } = nuevoVendedor;
    if (!edad || edad < 18 || edad > 65) {
      setError('La edad debe estar entre 18 y 65 años');
      return;
    }
    if (!salario || salario < 3000) {
      setError('El salario debe ser mayor o igual a 3000');
      return;
    }

    try {
      setLoading(true);
      await axiosWithFallback('put', `/put/vendedor/${editando}`, {
        edad,
        salario
      });
      alert('Vendedor actualizado exitosamente');
      cancelarEdicion();
    } catch (err: any) {
      console.error('Error al actualizar vendedor:', err);
      setError(err.response?.data?.message || 'Error al actualizar el vendedor');
    } finally {
      setLoading(false);
    }
  };

  const buscarVendedorPorId = async () => {
    if (!busquedaId.trim()) {
      setError('Ingrese un ID para buscar');
      return;
    }

    try {
      setLoading(true);
      await cargarVendedorParaEdicion(busquedaId);
      setBusquedaId('');
    } catch (err) {
      // El error ya se maneja en cargarVendedorParaEdicion
    }
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevoVendedor({ vendedor_id: '', nombre: '', edad: 18, salario: 3000 });
    setError('');
    navigate('/vendedores');
  };

  if (loading) {
    return (
      <div className="vendedor-container">
        <h2>Cargando...</h2>
      </div>
    );
  }

  return (
    <div className="vendedor-container">
      <h2>Gestión de Vendedores</h2>

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
          placeholder="Buscar vendedor por ID"
          value={busquedaId}
          onChange={(e) => setBusquedaId(e.target.value)}
        />
        <button onClick={buscarVendedorPorId} disabled={loading}>
          Buscar
        </button>
      </div>

      <div className="formulario">
        <input 
          type="text" 
          name="vendedor_id" 
          placeholder="ID del Vendedor" 
          value={nuevoVendedor.vendedor_id} 
          onChange={manejarCambio} 
          disabled={!!editando || loading} 
        />
        <input 
          type="text" 
          name="nombre" 
          placeholder="Nombre" 
          value={nuevoVendedor.nombre} 
          onChange={manejarCambio}
          disabled={!!editando || loading}
        />
        <input 
          type="number" 
          name="edad" 
          placeholder="Edad (18-65)" 
          value={nuevoVendedor.edad || ''} 
          onChange={manejarCambio}
          min="18"
          max="65"
          disabled={loading}
        />
        <input 
          type="number" 
          name="salario" 
          placeholder="Salario (mín. 3000)" 
          value={nuevoVendedor.salario || ''} 
          onChange={manejarCambio}
          min="3000"
          step="0.01"
          disabled={loading}
        />

        {editando ? (
          <>
            <button onClick={actualizarVendedor} disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
            <button onClick={cancelarEdicion} className="btn-cancelar" disabled={loading}>
              Cancelar
            </button>
          </>
        ) : (
          <button onClick={crearVendedor} disabled={loading}>
            {loading ? 'Creando...' : 'Crear'}
          </button>
        )}
      </div>

      <div className="mostrar-vendedores">
        <button onClick={() => navigate('/vendedores')}>
          Ir a lista de Vendedores
        </button>
      </div>
    </div>
  );
};

export default Vendedor;