import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const [cart, setCart] = useState([
    { id: 1, name: 'Hamburguesa', price: '$1200' },
    { id: 2, name: 'Pizza', price: '$950' },
  ]);

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Carrito</h2>
      {cart.map((item) => (
        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
          <span>{item.name} - {item.price}</span>
          <button onClick={() => removeFromCart(item.id)} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '5px' }}>
            Eliminar
          </button>
        </div>
      ))}
      {cart.length > 0 && (
        <Link to="/checkout">
          <button style={{ padding: '0.5rem', backgroundColor: '#6200ea', color: 'white', border: 'none', borderRadius: '5px' }}>Ir a pagar</button>
        </Link>
      )}
    </div>
  );
};

export default Cart;
