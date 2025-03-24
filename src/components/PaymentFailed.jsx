// src/pages/PaymentFailed.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const PaymentFailed = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">¡El pago falló!</h1>
      <p className="text-lg text-gray-700 mb-6">
        Hubo un problema al procesar tu pago. No se generó tu pedido.
      </p>
      <Link
        to="/"
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
      >
        Volver al inicio
      </Link>
    </div>
  );
};

export default PaymentFailed;
