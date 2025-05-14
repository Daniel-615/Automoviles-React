import React, { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';
import '../../components/css/Tiendas.css';

const PRIMARY_API = 'https://microservicio_ventas.serveo.net/ventas';
const FALLBACK_API = 'http://127.0.0.1:5000/ventas';

interface Tienda {
  tienda_key?: string;
  tienda_id: string;
  nombre_tienda: string;
  direccion: string;
  ciudad: string;
  tamaño_m2: number;
  horario_apertura: string;
  horario_cierre: string;
  gerente_key: string;
}

const Tienda: React.FC = () => {
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [nuevaTienda, setNuevaTienda] = useState<Omit<Tienda, 'tienda_key'>>({
    tienda_id: '',
    nombre_tienda: '',
    direccion: '',
    ciudad: '',
    tamaño_m2: 0,
    horario_apertura: '',
    horario_cierre: '',
    gerente_key: ''
  });
  const [editando, setEditando] = useState<string | null>(null);
  const [busquedaId, setBusquedaId] = useState('');

  const hacerPeticion = async (metodo: string, endpoint: string, data?: any) => {
    try {
      return await axios({ method: metodo as any, url: `${PRIMARY_API}${endpoint}`, data });
    } catch {
      return await axios({ method: metodo as any, url: `${FALLBACK_API}${endpoint}`, data });
    }
  };

  const obtenerTiendas = () => {
    hacerPeticion('get', '/get/tienda')
      .then(res => setTiendas(res.data.tiendas || []))
      .catch(err => console.error('Error al obtener tiendas:', err));
  };

  useEffect(() => {
    obtenerTiendas();
  }, []);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevaTienda(prev => ({
      ...prev,
      [name]: name === 'tamaño_m2' ? parseFloat(value) : value
    }));
  };

  const crearTienda = () => {
    const { tienda_id, nombre_tienda, direccion, ciudad, tamaño_m2, horario_apertura, horario_cierre, gerente_key } = nuevaTienda;
    if (!tienda_id || !nombre_tienda || !direccion || !ciudad || !tamaño_m2 || !horario_apertura || !horario_cierre || !gerente_key) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    hacerPeticion('post', '/post/tienda', nuevaTienda)
      .then(() => {
        obtenerTiendas();
        cancelarEdicion();
      })
      .catch(err => console.error('Error al crear tienda:', err));
  };

  const actualizarTienda = () => {
    if (!editando) return;

    const { horario_apertura, horario_cierre } = nuevaTienda;
    if (!horario_apertura || !horario_cierre) {
      alert("Debes ingresar los horarios de apertura y cierre.");
      return;
    }

    hacerPeticion('put', `/put/tienda/${editando}`, { horario_apertura, horario_cierre })
      .then(() => {
        obtenerTiendas();
        cancelarEdicion();
      })
      .catch(err => console.error('Error al actualizar tienda:', err));
  };

  const buscarTiendaPorId = () => {
    if (!busquedaId) return;

    hacerPeticion('get', `/get/tienda/${busquedaId}`)
      .then(res => {
        const t = res.data;
        console.log(`Tienda encontrada: ${t.nombre_tienda}`);
      })
      .catch(err => console.error('Tienda no encontrada:', err));
  };

  const iniciarEdicion = (t: Tienda) => {
    setEditando(t.tienda_key || null);
    setNuevaTienda({
      tienda_id: t.tienda_id,
      nombre_tienda: t.nombre_tienda,
      direccion: t.direccion,
      ciudad: t.ciudad,
      tamaño_m2: t.tamaño_m2,
      horario_apertura: t.horario_apertura,
      horario_cierre: t.horario_cierre,
      gerente_key: t.gerente_key
    });
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevaTienda({
      tienda_id: '',
      nombre_tienda: '',
      direccion: '',
      ciudad: '',
      tamaño_m2: 0,
      horario_apertura: '',
      horario_cierre: '',
      gerente_key: ''
    });
  };

  return (
    <div className="tienda-container">
      <h2>Gestión de Tiendas</h2>

      {/* Buscar por ID */}
      <div className="form-busqueda">
        <input
          type="text"
          placeholder="Buscar tienda por ID"
          value={busquedaId}
          onChange={(e) => setBusquedaId(e.target.value)}
        />
        <button onClick={buscarTiendaPorId}>Buscar</button>
      </div>

      {/* Formulario */}
      <div className="formulario">
        <input name="tienda_id" placeholder="ID" value={nuevaTienda.tienda_id} onChange={manejarCambio} disabled={!!editando} />
        <input name="nombre_tienda" placeholder="Nombre" value={nuevaTienda.nombre_tienda} onChange={manejarCambio} />
        <input name="direccion" placeholder="Dirección" value={nuevaTienda.direccion} onChange={manejarCambio} />
        <input name="ciudad" placeholder="Ciudad (UUID)" value={nuevaTienda.ciudad} onChange={manejarCambio} />
        <input name="tamaño_m2" type="number" placeholder="Tamaño (m²)" value={nuevaTienda.tamaño_m2} onChange={manejarCambio} />
        <input name="horario_apertura" type="time" placeholder="Apertura (HH:MM)" value={nuevaTienda.horario_apertura} onChange={manejarCambio} />
        <input name="horario_cierre" type="time" placeholder="Cierre (HH:MM)" value={nuevaTienda.horario_cierre} onChange={manejarCambio} />
        <input name="gerente_key" placeholder="Gerente (UUID)" value={nuevaTienda.gerente_key} onChange={manejarCambio} />

        {editando ? (
          <>
            <button onClick={actualizarTienda}>Actualizar</button>
            <button onClick={cancelarEdicion} className="btn-cancelar">Cancelar</button>
          </>
        ) : (
          <button onClick={crearTienda}>Crear</button>
        )}
      </div>

      {/* Lista */}
      <ul className="lista-tiendas">
        {tiendas.map((t) => (
          <li key={t.tienda_key}>
            <strong>{t.nombre_tienda}</strong> - {t.tienda_id}<br />
            Gerente: <em>{t.gerente_key}</em><br />
            ({t.horario_apertura} - {t.horario_cierre})
            <button onClick={() => iniciarEdicion(t)}>Editar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tienda;
