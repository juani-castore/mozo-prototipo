import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order; // Obtenemos los datos del pedido desde el estado de navegación

  if (!order) {
    // Si no hay pedido, redirigimos al inicio
    navigate("/");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center space-y-6">
      {/* Título */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-brick">¡Gracias por tu compra!</h2>
        <p className="text-lg text-gray-700 mt-2">Tu número de pedido es:</p>
        <h1 className="text-5xl font-extrabold text-gold mt-2">{order.orderId}</h1>
      </div>

      {/* Recordatorio */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md w-full max-w-lg text-center">
        <p className="font-bold text-lg">
          Recuerda tomar una captura de pantalla de esta información.
        </p>
        <p className="text-sm mt-1">
          Esto te servirá para mostrarlo al momento de retirar el pedido.
        </p>
      </div>

      {/* Detalles del pedido */}
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg space-y-4">
        <h3 className="text-2xl font-semibold text-brick">Detalles del Pedido</h3>
        <p>
          <strong>Nombre:</strong> {order.name}
        </p>
        <p>
          <strong>Email:</strong> {order.email}
        </p>
        <p>
          <strong>Hora de Retiro:</strong>{" "}
          {order.pickupTime === "0" ? "Retirar ahora" : order.pickupTime}
        </p>
        <p>
          <strong>Total:</strong> ${order.total}
        </p>
        <h4 className="text-lg font-bold text-gray-700 mt-4">Artículos</h4>
        <ul className="list-disc pl-6 text-gray-700">
          {order.items.map((item, index) => (
            <li key={index}>
              {item.nombre} x {item.cantidad} (${item.precio * item.cantidad})
            </li>
          ))}
        </ul>
      </div>

      {/* Botón Volver al menú */}
      <button
        onClick={() => navigate("/")}
        className="bg-brick text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:bg-brick-light transition-all"
      >
        Volver al menú
      </button>
    </div>
  );
};

export default OrderConfirmation;
