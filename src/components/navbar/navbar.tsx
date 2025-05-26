import { Link } from 'react-router-dom';
import { useState } from 'react';
import '../css/navbar.css';

const Navbar = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [dropdownActivo, setDropdownActivo] = useState<string | null>(null);

  const toggleMenu = () => setMenuAbierto(prev => !prev);
  const toggleDropdown = (label: string) =>
    setDropdownActivo(prev => (prev === label ? null : label));

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="logo">VentasApp</div>

        <button className="navbar-toggle" onClick={toggleMenu}>
          ☰
        </button>

        <ul className={`nav-links ${menuAbierto ? 'abierto' : ''}`}>
          <li><Link to="/">Inicio</Link></li>

          {/* Catálogos generales */}
          <li
            className={`dropdown ${dropdownActivo === 'catalogos' ? 'activo' : ''}`}
            onClick={() => toggleDropdown('catalogos')}
          >
            <span className="dropdown-toggle">Catálogos</span>
            <ul className="dropdown-menu">
              <li><Link to="/clientes">Clientes</Link></li>
              <li><Link to="/segmentos">Segmentos</Link></li>
              <li><Link to="/region">Región</Link></li>
              <li><Link to="/ciudades">Ciudades</Link></li>
              <li><Link to="/tiendas">Tiendas</Link></li>
              <li><Link to="/gerentes">Gerente</Link></li>
            </ul>
          </li>

          {/* Relaciones */}
          <li
            className={`dropdown ${dropdownActivo === 'relaciones' ? 'activo' : ''}`}
            onClick={() => toggleDropdown('relaciones')}
          >
            <span className="dropdown-toggle">Relaciones</span>
            <ul className="dropdown-menu">
              <li><Link to="/cliente-segmento">Cliente-Segmento</Link></li>
              <li><Link to="/vendedor">Vendedores</Link></li>
              <li><Link to="/vendedor_tienda">Vendedor-Tienda</Link></li>
            </ul>
          </li>

          {/* Catálogos de ventas */}
          <li
            className={`dropdown ${dropdownActivo === 'ventasCatalogos' ? 'activo' : ''}`}
            onClick={() => toggleDropdown('ventasCatalogos')}
          >
            <span className="dropdown-toggle">Catálogos Ventas</span>
            <ul className="dropdown-menu">
              <li><Link to="/categoria">Categorías</Link></li>
              <li><Link to="/marca">Marcas</Link></li>
              <li><Link to="/modelo">Modelos</Link></li>
              <li><Link to="/producto">Productos</Link></li>
              <li><Link to="/fecha">Fechas</Link></li>
            </ul>
          </li>

          {/* Módulo de ventas */}
          <li
            className={`dropdown ${dropdownActivo === 'ventas' ? 'activo' : ''}`}
            onClick={() => toggleDropdown('ventas')}
          >
            <span className="dropdown-toggle">Ventas</span>
            <ul className="dropdown-menu">
              <li><Link to="/ventas">Registrar Venta</Link></li>
              <li><Link to="/lista-ventas">Ver Ventas</Link></li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
