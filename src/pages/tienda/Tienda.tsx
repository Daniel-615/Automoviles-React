import React, { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../components/css/Tiendas.css';

const PRIMARY_API = 'https://autos-flask-umg-backend-ajbqcxhaaudjbdf0.mexicocentral-01.azurewebsites.net/ventas';
const FALLBACK_API = 'http://127.0.0.1:5000/ventas';

interface Tienda {
  tienda_key?: string;
  tienda_id: string;
  nombre_tienda: string;
  direccion: string;
  ciudad_key: string;
  tamaño_m2: number;
  horario_apertura: string;
  horario_cierre: string;
  gerente_key: string;
}

interface Ciudad {
  ciudad_key: string;
  ciudad_nombre: string;
}

interface Gerente {
  gerente_key: string;
  nombre: string;
}

const Tienda: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [nuevaTienda, setNuevaTienda] = useState<Omit<Tienda, 'tienda_key'>>({
    tienda_id: '',
    nombre_tienda: '',
    direccion: '',
    ciudad_key: '',
    tamaño_m2: 0,
    horario_apertura: '',
    horario_cierre: '',
    gerente_key: ''
  });

  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [gerentes, setGerentes] = useState<Gerente[]>([]);
  const [editando, setEditando] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hacerPeticion = async (metodo: string, endpoint: string, data?: any) => {
    try {
      return await axios({ method: metodo as any, url: `${PRIMARY_API}${endpoint}`, data });
    } catch {
      return await axios({ method: metodo as any, url: `${FALLBACK_API}${endpoint}`, data });
    }
  };

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const uuid = params.get('uuid');
    if (uuid) {
      buscarTiendaPorUUID(uuid);
    }
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      
      const [ciudadesRes, gerentesRes] = await Promise.all([
        hacerPeticion('get', '/get/ciudad'),
        hacerPeticion('get', '/get/gerente')
      ]);

      setCiudades(ciudadesRes.data.ciudades || ciudadesRes.data);
      setGerentes(gerentesRes.data.gerentes || gerentesRes.data);
    } catch (err) {
      console.error('Error al cargar datos iniciales:', err);
      setError('Error al cargar ciudades y gerentes');
    } finally {
      setLoading(false);
    }
  };

  const manejarCambio = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevaTienda(prev => ({
      ...prev,
      [name]: name === 'tamaño_m2' ? parseFloat(value) || 0 : value
    }));
    setError('');
  };

  const validarCampos = (): boolean => {
    const { tienda_id, nombre_tienda, direccion, ciudad_key, tamaño_m2, horario_apertura, horario_cierre, gerente_key } = nuevaTienda;
    
    if (!tienda_id.trim()) {
      setError('El ID de la tienda es requerido');
      return false;
    }
    if (!nombre_tienda.trim()) {
      setError('El nombre de la tienda es requerido');
      return false;
    }
    if (!direccion.trim()) {
      setError('La dirección es requerida');
      return false;
    }
    if (!ciudad_key) {
      setError('Debe seleccionar una ciudad');
      return false;
    }
    if (!tamaño_m2 || tamaño_m2 <= 0) {
      setError('El tamaño debe ser mayor a 0');
      return false;
    }
    if (!horario_apertura) {
      setError('El horario de apertura es requerido');
      return false;
    }
    if (!horario_cierre) {
      setError('El horario de cierre es requerido');
      return false;
    }
    if (!gerente_key) {
      setError('Debe seleccionar un gerente');
      return false;
    }

    // Validar que el horario de cierre sea después del de apertura
    if (horario_apertura >= horario_cierre) {
      setError('El horario de cierre debe ser posterior al de apertura');
      return false;
    }

    return true;
  };

  const crearTienda = async () => {
    if (!validarCampos()) return;

    try {
      setLoading(true);
      
      // Ajustar los datos según lo que espera el backend
      const datosParaEnviar = {
        ...nuevaTienda,
        ciudad: nuevaTienda.ciudad_key // El backend espera 'ciudad' no 'ciudad_key'
      };
      delete (datosParaEnviar as any).ciudad_key;

      await hacerPeticion('post', '/post/tienda', datosParaEnviar);
      alert('Tienda creada exitosamente');
      navigate('/lista-tiendas');
    } catch (err: any) {
      console.error('Error al crear tienda:', err);
      setError(err.response?.data?.message || 'Error al crear la tienda');
    } finally {
      setLoading(false);
    }
  };

  const actualizarTienda = async () => {
    if (!editando || !validarCampos()) return;

    try {
      setLoading(true);
      
      // Para actualizar, el backend solo permite cambiar horarios
      await hacerPeticion('put', `/put/tienda/${editando}`, {
        horario_apertura: nuevaTienda.horario_apertura,
        horario_cierre: nuevaTienda.horario_cierre
      });
      
      alert('Tienda actualizada exitosamente');
      navigate('/lista-tiendas');
    } catch (err: any) {
      console.error('Error al actualizar tienda:', err);
      setError(err.response?.data?.message || 'Error al actualizar la tienda');
    } finally {
      setLoading(false);
    }
  };

  const buscarTiendaPorUUID = async (uuid: string) => {
    try {
      setLoading(true);
      const res = await hacerPeticion('get', `/get/tienda/${uuid}`);
      const t = res.data;
      
      setNuevaTienda({
        tienda_id: t.tienda_id,
        nombre_tienda: t.nombre_tienda,
        direccion: t.direccion,
        ciudad_key: t.ciudad,
        tamaño_m2: t.tamaño_m2,
        horario_apertura: t.horario_apertura,
        horario_cierre: t.horario_cierre,
        gerente_key: t.gerente_key
      });
      setEditando(t.tienda_key);
    } catch (err: any) {
      console.error('Error al buscar tienda:', err);
      setError(err.response?.data?.message || 'Error al buscar la tienda');
    } finally {
      setLoading(false);
    }
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevaTienda({
      tienda_id: '',
      nombre_tienda: '',
      direccion: '',
      ciudad_key: '',
      tamaño_m2: 0,
      horario_apertura: '',
      horario_cierre: '',
      gerente_key: ''
    });
    setError('');
    navigate('/tiendas');
  };

  if (loading) {
    return (
      <div className="tienda-container">
        <h2>Cargando...</h2>
      </div>
    );
  }

  return (
    <div className="tienda-container">
      <h2>Gestión de Tiendas</h2>

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

      <div className="formulario">
        <input 
          name="tienda_id" 
          placeholder="ID de la Tienda" 
          value={nuevaTienda.tienda_id} 
          onChange={manejarCambio} 
          disabled={!!editando || loading} 
        />
        <input 
          name="nombre_tienda" 
          placeholder="Nombre de la Tienda" 
          value={nuevaTienda.nombre_tienda} 
          onChange={manejarCambio}
          disabled={!!editando || loading}
        />
        <input 
          name="direccion" 
          placeholder="Dirección" 
          value={nuevaTienda.direccion} 
          onChange={manejarCambio}
          disabled={!!editando || loading}
        />

        <select 
          name="ciudad_key" 
          value={nuevaTienda.ciudad_key} 
          onChange={manejarCambio} 
          disabled={!!editando || loading}
        >
          <option value="">-- Selecciona una ciudad --</option>
          {ciudades.map(c => (
            <option key={c.ciudad_key} value={c.ciudad_key}>
              {c.ciudad_nombre}
            </option>
          ))}
        </select>

        <input 
          name="tamaño_m2" 
          type="number" 
          placeholder="Tamaño (m²)" 
          value={nuevaTienda.tamaño_m2 || ''} 
          onChange={manejarCambio}
          disabled={!!editando || loading}
          min="1"
        />
        <input 
          name="horario_apertura" 
          type="time" 
          value={nuevaTienda.horario_apertura} 
          onChange={manejarCambio}
          disabled={loading}
        />
        <input 
          name="horario_cierre" 
          type="time" 
          value={nuevaTienda.horario_cierre} 
          onChange={manejarCambio}
          disabled={loading}
        />

        <select 
          name="gerente_key" 
          value={nuevaTienda.gerente_key} 
          onChange={manejarCambio}
          disabled={!!editando || loading}
        >
          <option value="">-- Selecciona un gerente --</option>
          {gerentes.map(g => (
            <option key={g.gerente_key} value={g.gerente_key}>
              {g.nombre}
            </option>
          ))}
        </select>

        {editando ? (
          <>
            <button onClick={actualizarTienda} disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
            <button onClick={cancelarEdicion} className="btn-cancelar" disabled={loading}>
              Cancelar
            </button>
          </>
        ) : (
          <button onClick={crearTienda} disabled={loading}>
            {loading ? 'Creando...' : 'Crear'}
          </button>
        )}
      </div>

      <div className="mostrar-tiendas">
        <button onClick={() => navigate('/lista-tiendas')}>Ir al listado</button>
      </div>
    </div>
  );
};

export default Tienda;