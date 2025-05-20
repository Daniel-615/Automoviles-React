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

  const hacerPeticion = async (metodo: string, endpoint: string, data?: any) => {
    try {
      return await axios({ method: metodo as any, url: `${PRIMARY_API}${endpoint}`, data });
    } catch {
      return await axios({ method: metodo as any, url: `${FALLBACK_API}${endpoint}`, data });
    }
  };

  useEffect(() => {
    hacerPeticion('get', '/get/ciudad')
      .then(res => setCiudades(res.data.ciudades || res.data))
      .catch(err => console.error('Error al cargar ciudades:', err));

    hacerPeticion('get', '/get/gerente')
      .then(res => setGerentes(res.data.gerentes || res.data))
      .catch(err => console.error('Error al cargar gerentes:', err));
  }, []);

  // Buscar tienda SOLO si viene con ?uuid=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const uuid = params.get('uuid');
    if (uuid) {
      buscarTiendaPorUUID(uuid);
    }
  }, []); // No depende de location porque no queremos que se dispare múltiples veces

  const manejarCambio = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevaTienda(prev => ({
      ...prev,
      [name]: name === 'tamaño_m2' ? parseFloat(value) || 0 : value
    }));
  };

  const validarCampos = (): boolean => {
    const { tienda_id, nombre_tienda, direccion, ciudad_key, tamaño_m2, horario_apertura, horario_cierre, gerente_key } = nuevaTienda;
    return !!(tienda_id && nombre_tienda && direccion && ciudad_key && tamaño_m2 > 0 && horario_apertura && horario_cierre && gerente_key);
  };

  const crearTienda = () => {
    if (!validarCampos()) return;

    hacerPeticion('post', '/post/tienda', nuevaTienda)
      .then(() => navigate('/lista-tiendas'))
      .catch(err => console.error('Error al crear tienda:', err));
  };

  const actualizarTienda = () => {
    if (!editando || !validarCampos()) return;

    hacerPeticion('put', `/put/tienda/${editando}`, nuevaTienda)
      .then(() => navigate('/lista-tiendas'))
      .catch(err => console.error('Error al actualizar tienda:', err));
  };

  const buscarTiendaPorUUID = (uuid: string) => {
    hacerPeticion('get', `/get/tienda/${uuid}`)
      .then(res => {
        const t = res.data;
        setNuevaTienda({
          tienda_id: t.tienda_id,
          nombre_tienda: t.nombre_tienda,
          direccion: t.direccion,
          ciudad_key: t.ciudad_key,
          tamaño_m2: t.tamaño_m2,
          horario_apertura: t.horario_apertura,
          horario_cierre: t.horario_cierre,
          gerente_key: t.gerente_key
        });
        setEditando(t.tienda_key);
      })
      .catch(err => console.error('Error al buscar tienda:', err));
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
    navigate('/tiendas'); // Limpia ?uuid
  };

  return (
    <div className="tienda-container">
      <h2>Gestión de Tiendas</h2>

      <div className="formulario">
        <input name="tienda_id" placeholder="ID" value={nuevaTienda.tienda_id} onChange={manejarCambio} disabled={!!editando} />
        <input name="nombre_tienda" placeholder="Nombre" value={nuevaTienda.nombre_tienda} onChange={manejarCambio} />
        <input name="direccion" placeholder="Dirección" value={nuevaTienda.direccion} onChange={manejarCambio} />

        <select name="ciudad_key" value={nuevaTienda.ciudad_key} onChange={manejarCambio} disabled={!!editando}>
          <option value="">-- Selecciona una ciudad --</option>
          {ciudades.map(c => (
            <option key={c.ciudad_key} value={c.ciudad_key}>{c.ciudad_nombre}</option>
          ))}
        </select>

        <input name="tamaño_m2" type="number" placeholder="Tamaño (m²)" value={nuevaTienda.tamaño_m2 || ''} onChange={manejarCambio} />
        <input name="horario_apertura" type="time" value={nuevaTienda.horario_apertura} onChange={manejarCambio} />
        <input name="horario_cierre" type="time" value={nuevaTienda.horario_cierre} onChange={manejarCambio} />

        <select name="gerente_key" value={nuevaTienda.gerente_key} onChange={manejarCambio}>
          <option value="">-- Selecciona un gerente --</option>
          {gerentes.map(g => (
            <option key={g.gerente_key} value={g.gerente_key}>{g.nombre}</option>
          ))}
        </select>

        {editando ? (
          <>
            <button onClick={actualizarTienda}>Actualizar</button>
            <button onClick={cancelarEdicion} className="btn-cancelar">Cancelar</button>
          </>
        ) : (
          <button onClick={crearTienda}>Crear</button>
        )}
      </div>

      <div className="mostrar-tiendas">
        <button onClick={() => navigate('/lista-tiendas')}>Ir al listado</button>
      </div>
    </div>
  );
};

export default Tienda;
