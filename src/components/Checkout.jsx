import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../CartContext";


const Checkout = () => {
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    pickupTime: "",
    comments: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const carritoMP = cart.map((item) => ({
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
      }));

      const orderData = {
        name: formData.name,
        email: formData.email,
        pickupTime: formData.pickupTime,
        comments: formData.comments,
        cart,
      };

      const response = await fetch(
        "https://us-central1-prototipo-mozo.cloudfunctions.net/generarLinkDePago",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            carrito: carritoMP,
            mesa: "Mesa 1",
            orderData,
          }),
        }
      );

      if (!response.ok) throw new Error("Error HTTP: " + response.status);
      const data = await response.json();

      localStorage.setItem("orderData", JSON.stringify(orderData));
      window.location.href = data.init_point;
    } catch (error) {
      console.error("❌ Error al generar link de pago:", error);
      alert("No se pudo procesar el pago.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center text-brick mb-8">
        Formulario de Pedido
      </h2>
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto bg-white shadow-lg p-6 rounded-lg"
      >
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2 text-gray-700">
            Nombre completo
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-brick-light"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2 text-gray-700">
            Correo electrónico
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-brick-light"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2 text-gray-700">
            Hora de retiro
          </label>
          <input
            type="time"
            name="pickupTime"
            value={formData.pickupTime}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-brick-light"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2 text-gray-700">
            Comentarios
          </label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows="4"
            placeholder="¿Hay algo más que deberíamos saber sobre tu pedido?"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-brick-light"
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 mt-6 bg-brick text-white font-bold rounded-lg shadow-lg hover:bg-brick-light transition-all"
        >
          {isLoading ? "Procesando..." : "Confirmar Pedido"}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
