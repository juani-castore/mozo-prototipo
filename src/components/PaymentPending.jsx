// src/pages/PaymentPending.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const PaymentPending = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-3xl font-bold text-yellow-600 mb-4">Pago pendiente</h1>
      <p className="text-lg text-gray-700 mb-6">
        Tu pago aún está en proceso. Te avisaremos cuando se confirme.
      </p>
      <Link
        to="/"
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded"
      >
        Volver al inicio
      </Link>
    </div>
  );
};

export default PaymentPending;
