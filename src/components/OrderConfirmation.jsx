import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';

const OrderConfirmation = () => {
  const navigate = useNavigate();

  // Generar un número de pedido aleatorio
  const orderNumber = Math.floor(100000 + Math.random() * 900000);

  return (
    <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>¡Gracias por tu compra!</h2>
      <p>Tu número de pedido es:</p>
      <h1 style={{ color: '#CC603B' }}>{orderNumber}</h1>
      <div style={{ margin: '2rem auto', display: 'inline-block' }}>
        <QRCodeCanvas
          value={`Pedido: ${orderNumber}`}
          size={200}
          bgColor="#ffffff"
          fgColor="#CC603B"
        />
      </div>
      <p>Muestra este QR para retirar tu pedido.</p>
      <button
        onClick={() => navigate('/')}
        style={{
          backgroundColor: '#CC7A3B',
          color: '#fff',
          padding: '0.5rem 1rem',
          borderRadius: '5px',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Volver al menú
      </button>
    </div>
  );
};

export default OrderConfirmation;
