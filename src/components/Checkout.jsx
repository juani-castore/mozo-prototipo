import React from 'react';

const Checkout = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Checkout</h2>
      <p>Gracias por tu pedido. Presiona el botón para confirmar tu compra.</p>
      <button style={{ padding: '0.5rem', backgroundColor: '#6200ea', color: 'white', border: 'none', borderRadius: '5px' }}>
        Confirmar pago
      </button>
    </div>
  );
};

export default Checkout;
