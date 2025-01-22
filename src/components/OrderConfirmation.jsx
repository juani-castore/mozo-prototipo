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
    <div
      className="container"
      style={{
        textAlign: "center",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh",
      }}
    >
      <div>
        <h2>¡Gracias por tu compra!</h2>
        <p>Tu número de pedido es:</p>
        <h1 style={{ color: "#CC603B" }}>{order.orderId}</h1>
        <h3>Detalles del Pedido</h3>
        <p>
          <strong>Nombre:</strong> {order.name}
        </p>
        <p>
          <strong>Email:</strong> {order.email}
        </p>
        <p>
          <strong>Hora de Retiro:</strong> {order.pickupTime}
        </p>
        <p>
          <strong>Total:</strong> ${order.total}
        </p>
        <h4>Artículos</h4>
        <ul style={{ textAlign: "left", display: "inline-block" }}>
          {order.items.map((item, index) => (
            <li key={index}>
              {item.nombre} x {item.cantidad} (${item.precio * item.cantidad})
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={() => navigate("/")}
        style={{
          backgroundColor: "#CC7A3B",
          color: "#fff",
          padding: "0.5rem 1rem",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
          marginTop: "1rem",
          alignSelf: "center",
        }}
      >
        Volver al menú
      </button>
    </div>
  );
};

export default OrderConfirmation;
