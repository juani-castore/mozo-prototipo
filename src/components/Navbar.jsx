import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={{ padding: '1rem', backgroundColor: '#6200ea', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
      <h1>Mozo</h1>
      <div>
        <Link to="/" style={{ margin: '0 1rem', color: 'white', textDecoration: 'none' }}>Menú</Link>
        <Link to="/cart" style={{ margin: '0 1rem', color: 'white', textDecoration: 'none' }}>Carrito</Link>
      </div>
    </nav>
  );
};

export default Navbar;
