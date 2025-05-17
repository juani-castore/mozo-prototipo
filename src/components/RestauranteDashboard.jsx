// RestauranteDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const RestauranteDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <h2 className="text-3xl font-semibold mb-6">Panel de Administración</h2>
      <div className="flex gap-4">
        <button
          className="bg-brick text-white px-6 py-2 rounded shadow hover:bg-brick-light"
          onClick={() => navigate("/restaurante/pedidos")}
        >
          Pedidos
        </button>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
          onClick={() => navigate("/restaurante/menu")}
        >
          Menú
        </button>
      </div>
    </div>
  );
};

export default RestauranteDashboard;
