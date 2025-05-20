import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/navbar';
import Tiendas from './pages/tiendaBi/Tiendas';
import Gerentes from './pages/gerente/Gerente';
import Cliente from './pages/cliente/Cliente';
import Ciudad from './pages/ciudad/Ciudad';
import ClienteSegmento from './pages/cliente_segmento/ClienteSegmento';
import Region from './pages/region/Region';
import Segmento from './pages/segmento/Segmento';
import Tienda from './pages/tienda/Tienda';
import Vendedor from './pages/vendedor/Vendedor';
import VendedorTienda from './pages/vendedor_tienda/vendedor_tienda';
import ListaVendedores from './pages/vendedor/listaVendedores';
import ListaClientes from './pages/cliente/ListaClientes';
import ListaSegmentos from './pages/segmento/ListaSegmentos'
import ListaRegiones from './pages/region/ListaRegiones';
import ListaCiudades from './pages/ciudad/ListaCiudades'
import ListaTiendas from './pages/tienda/ListaTiendas';
import ListaClienteSegmento from './pages/cliente_segmento/ListaClienteSegmento';
import ListaVendedorTiendas from './pages/vendedor_tienda/ListasVendedorTiendas';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import './App.css';

const vehiculos = [
  '/images/car1.jpg',
  '/images/car2.jpg',
  '/images/car3.jpg',
  '/images/car4.jpg',
];

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <div className="welcome-card">
                <h2>Bienvenido a la App de Ventas de Vehículos</h2>
                <Carousel
                  additionalTransfrom={0}
                  arrows
                  autoPlay
                  autoPlaySpeed={4000}
                  centerMode={false}
                  className="carousel-container"
                  containerClass="carousel-wrapper"
                  draggable
                  infinite
                  itemClass="carousel-item-padding"
                  keyBoardControl
                  minimumTouchDrag={80}
                  responsive={{
                    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 2 },
                    tablet: { breakpoint: { max: 1024, min: 768 }, items: 1 },
                    mobile: { breakpoint: { max: 768, min: 0 }, items: 1 }
                  }}
                  showDots={true}
                  swipeable
                >
                  {vehiculos.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      alt={`Vehículo ${index + 1}`}
                      className="carousel-image"
                    />
                  ))}
                </Carousel>
                <p className="read-the-docs">
                  Gestiona clientes, tiendas, regiones y más desde un solo lugar.
                </p>
              </div>
            }
          />
          <Route path="/tiendasBi" element={<Tiendas />} />
          <Route path="/gerentes" element={<Gerentes />} />
          <Route path="/ciudades" element={<Ciudad />} />
          <Route path="/cliente" element={<Cliente />} />
          <Route path="/cliente-segmento" element={<ClienteSegmento />} />
          <Route path="/region" element={<Region />} />
          <Route path="/segmentos" element={<Segmento />} />
          <Route path="/tiendas" element={<Tienda />} />
          <Route path="/vendedor" element={<Vendedor />} />
          <Route path="/vendedor_tienda" element={<VendedorTienda />} />
          <Route path="/vendedores" element={<ListaVendedores />} />
          <Route path="/clientes" element={<ListaClientes />} />
          <Route path="/lista-segmentos" element={<ListaSegmentos />} />
          <Route path="/lista-regiones" element={<ListaRegiones />} />
          <Route path="/lista-ciudades" element={<ListaCiudades />} />
          <Route path="/lista-tiendas" element={<ListaTiendas />} />
          <Route path="/lista-cliente-segmento" element={<ListaClienteSegmento />} />
          <Route path="/lista-vendedor-tienda" element={<ListaVendedorTiendas />} />

          <Route path="/cliente/:id" element={<Cliente />} />
          <Route path="/cliente-segmento/:id" element={<ClienteSegmento />} />
          <Route path="/ciudades/:id" element={<Ciudad />} />
          <Route path="/segmentos/:id" element={<Segmento />} />
          <Route path="/region/:id" element={<Region />} />
          <Route path="/vendedor/:id" element={<Vendedor/>}/>

          <Route path="*" element={<h2>404 - Página no encontrada</h2>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;