import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <h1>Mozo</h1>
      <div>
        <Link to="/">Menú</Link>
        <Link to="/cart">Carrito</Link>
      </div>
    </nav>
  );
};

export default Navbar;
