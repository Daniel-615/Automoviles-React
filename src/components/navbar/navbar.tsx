import { Link } from 'react-router-dom';
import '../css/navbar.css';

const Navbar = () => (
  <nav className="navbar">
    <div className="navbar-content">
      <div className="logo">VentasApp</div>
      <ul className="nav-links">
        <li><Link to="/">Inicio</Link></li>
        <li className="dropdown">
          <span className="dropdown-toggle">Catálogos</span>
          <ul className="dropdown-menu">
            <li><Link to="/clientes">Clientes</Link></li>
            <li><Link to="/segmentos">Segmentos</Link></li>
            <li><Link to="/region">Región</Link></li>
            <li><Link to="/ciudades">Ciudades</Link></li>
            <li><Link to="/tiendas">Tiendas</Link></li>
          </ul>
        </li>
        <li className="dropdown">
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

export default Navbar;
