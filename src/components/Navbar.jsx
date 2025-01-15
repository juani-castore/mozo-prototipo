import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; // Asegúrate de que el archivo exista en la carpeta

const Navbar = () => {
  return (
    <nav>
      <img src={logo} alt="Logo Mozo" />
      <div className="nav-links">
        <Link to="/" className="nav-button">Menú</Link>
        <Link to="/cart" className="nav-button">Carrito</Link>
      </div>
    </nav>
  );
};

export default Navbar;
