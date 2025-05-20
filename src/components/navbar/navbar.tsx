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
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
