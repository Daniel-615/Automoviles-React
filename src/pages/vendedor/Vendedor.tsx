import React, { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import '../../components/css/vendedor.css'
const PRIMARY_API = 'https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas';
const FALLBACK_API = 'http://127.0.0.1:5000/ventas';

const axiosWithFallback = async (method: 'get' | 'post' | 'put', path: string, data?: any) => {
  try {
    return await axios({ method, url: `${PRIMARY_API}${path}`, data });
  } catch (error) {
    console.warn('Fallo la ruta principal. Usando fallback...');
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
  const [nuevoVendedor, setNuevoVendedor] = useState<Omit<Vendedor, 'vendedor_key' | 'activo'>>({
    vendedor_id: '',
    nombre: '',
    edad: 0,
    salario: 0
  });
  const [editando, setEditando] = useState<Vendedor | null>(null);
  const [busquedaId, setBusquedaId] = useState('');

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoVendedor({ ...nuevoVendedor, [name]: name === 'edad' || name === 'salario' ? parseFloat(value) : value });
  };

  const crearVendedor = () => {
    const { vendedor_id, nombre, edad, salario } = nuevoVendedor;
    if (!vendedor_id || !nombre || !edad || !salario) return;

    axiosWithFallback('post', '/post/vendedor', nuevoVendedor)
      .then(() => {
        setNuevoVendedor({ vendedor_id: '', nombre: '', edad: 0, salario: 0 });
      })
      .catch(err => console.error('Error al crear vendedor:', err));
  };

  const buscarVendedorPorId = () => {
    if (!busquedaId) return;

    axiosWithFallback('get', `/get/vendedor/${busquedaId}`)
      .then(res => {
        const v = res.data;
        console.log(`Vendedor encontrado: ${v.nombre} - Activo: ${v.activo}`);
      })
      .catch(err => console.error('Vendedor no encontrado:', err));
  };

  return (
    <div className="vendedor-container">
      <h2>Gestión de Vendedores</h2>

      <div className="form-busqueda">
        <input
          type="text"
          placeholder="Buscar vendedor por ID"
          value={busquedaId}
          onChange={(e) => setBusquedaId(e.target.value)}
        />
        <button onClick={buscarVendedorPorId}>Buscar</button>
      </div>

      <div className="formulario">
        <input type="text" name="vendedor_id" placeholder="ID" value={nuevoVendedor.vendedor_id} onChange={manejarCambio} disabled={!!editando} />
        <input type="text" name="nombre" placeholder="Nombre" value={nuevoVendedor.nombre} onChange={manejarCambio} />
        <input type="number" name="edad" placeholder="Edad" value={nuevoVendedor.edad} onChange={manejarCambio} />
        <input type="number" name="salario" placeholder="Salario" value={nuevoVendedor.salario} onChange={manejarCambio} />
        <button onClick={crearVendedor}>Crear</button>
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
