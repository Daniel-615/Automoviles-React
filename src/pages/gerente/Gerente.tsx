import React, { useEffect, useState, ChangeEvent } from 'react';
import '../../components/css/Gerente.css';
import axios from 'axios';

const PRIMARY_API = 'https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas';
const FALLBACK_API = 'http://localhost:5000/ventas';

interface Gerente {
  gerente_key: string;
  gerente_id: string;
  nombre: string;
}

const Gerentes: React.FC = () => {
  const [gerentes, setGerentes] = useState<Gerente[]>([]);
  const [nuevoGerente, setNuevoGerente] = useState<Omit<Gerente, 'gerente_id'>>({
    nombre: '',
    gerente_key: ''
  });
  const [editando, setEditando] = useState<Gerente | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const apiRequest = async (method: 'get' | 'post' | 'put', endpoint: string, body?: any) => {
    try {
      return await axios({ method, url: `${PRIMARY_API}${endpoint}`, data: body });
    } catch {
      return await axios({ method, url: `${FALLBACK_API}${endpoint}`, data: body });
    }
  };

  const obtenerGerentes = () => {
    apiRequest('get', '/get/gerente')
      .then(res => {
        const datos = res.data.gerentes || [];
        const formateados = datos.map((g: any): Gerente => ({
          gerente_key: g.gerente_key || g.gerente_id || '',
          gerente_id: g.gerente_id || g.gerente_key || '',
          nombre: g.nombre
        }));
        setGerentes(formateados);
      })
      .catch(err => {
        console.error('No se pudieron cargar los gerentes:', err);
      });
  };

  useEffect(() => {
    obtenerGerentes();
  }, []);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoGerente(prev => ({ ...prev, [name]: value }));
  };

  const crearGerente = () => {
    const { nombre, gerente_key } = nuevoGerente;
    if (!nombre || !gerente_key) return;

    const payload = { gerente_id: gerente_key, gerente_nombre: nombre };

    apiRequest('post', '/post/gerente', payload)
      .then(() => {
        obtenerGerentes();
        setNuevoGerente({ nombre: '', gerente_key: '' });
      })
      .catch(err => {
        console.error('Error al crear gerente:', err);
      });
  };

  const actualizarGerente = () => {
    if (!editando?.gerente_key) return;

    apiRequest('put', `/put/gerente/${editando.gerente_key}`, {
      gerente_nombre: nuevoGerente.nombre
    })
      .then(() => {
        obtenerGerentes();
        cancelarEdicion();
      })
      .catch(err => {
        console.error('Error al actualizar gerente:', err);
      });
  };

  const buscarGerente = () => {
    if (!busqueda) return;

    apiRequest('get', `/get/gerente/${busqueda}`)
      .then(res => {
        const g = res.data;
        console.log(`Gerente encontrado: ${g.nombre} (${g.gerente_id || g.gerente_key})`);
      })
      .catch(err => {
        console.error('Gerente no encontrado:', err);
      });
  };

  const iniciarEdicion = (gerente: Gerente) => {
    setEditando(gerente);
    setNuevoGerente({ nombre: gerente.nombre, gerente_key: gerente.gerente_key });
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevoGerente({ nombre: '', gerente_key: '' });
  };

  return (
    <div className="ciudad-container">
      <h2>Gestión de Gerentes</h2>

      <div className="form-busqueda">
        <input
          type="text"
          placeholder="Buscar gerente por ID"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button onClick={buscarGerente}>Buscar</button>
      </div>

      <div className="formulario">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={nuevoGerente.nombre}
          onChange={manejarCambio}
        />
        <input
          type="text"
          name="gerente_key"
          placeholder="UUID"
          value={nuevoGerente.gerente_key}
          onChange={manejarCambio}
          disabled={!!editando}
        />
        {editando ? (
          <>
            <button onClick={actualizarGerente}>Actualizar</button>
            <button onClick={cancelarEdicion} className="btn-cancelar">Cancelar</button>
          </>
        ) : (
          <button onClick={crearGerente}>Crear</button>
        )}
      </div>

      <ul className="lista-ciudades">
        {gerentes.map((g) => (
          <li key={g.gerente_key}>
            <strong>{g.nombre}</strong> - {g.gerente_id}
            <div>
              <button onClick={() => iniciarEdicion(g)}>Editar</button>
              <button onClick={buscarGerente} className="btn-ver">Ver</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Gerentes;
