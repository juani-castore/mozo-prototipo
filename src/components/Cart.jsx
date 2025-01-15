import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const [cart, setCart] = useState([
    { id: 4, name: 'Wrap', price: '$5500' },
    { id: 5, name: 'Café', price: '$2500' },
  ]);

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  return (
    <div className="container">
      <h2>Carrito</h2>
      {cart.length > 0 ? (
        cart.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--white)',
              border: '1px solid var(--brick)',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              minHeight: '100px', // Altura fija
            }}
          >
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '0.3rem', // Espaciado interno más compacto
              }}
            >
              <span
                style={{
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  lineHeight: '1.2',
                }}
              >
                {item.name}
              </span>
              <span style={{ color: 'var(--brick)', fontSize: '0.9rem' }}>
                {item.price}
              </span>
            </div>
            <button
              onClick={() => removeFromCart(item.id)}
              style={{
                backgroundColor: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                padding: '0.4rem 0.6rem',
                fontSize: '0.8rem',
                cursor: 'pointer',
                minWidth: '70px',
                height: '35px', // Altura consistente del botón
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Eliminar
            </button>
          </div>
        ))
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--brick)' }}>
          Tu carrito está vacío.
        </p>
      )}
      {cart.length > 0 && (
        <Link to="/checkout">
          <button
            style={{
              width: '100%',
              backgroundColor: 'var(--gold)',
              color: 'white',
              padding: '0.7rem',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              marginTop: '1rem',
            }}
          >
            Ir a pagar
          </button>
        </Link>
      )}
    </div>
  );
};

export default Cart;