import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../CartContext";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebaseConfig";

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

    if (cart.length === 0) {
      alert("Tu carrito está vacío.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Carrito actual:", cart);

      const carritoMP = cart.map((item) => ({
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
      }));

      console.log("Carrito enviado a generarLinkDePago:", carritoMP);

      if (!Array.isArray(carritoMP) || carritoMP.length === 0) {
        console.error("El carrito no es un arreglo válido o está vacío:", carritoMP);
        alert("El carrito no es válido. Por favor, revisa tu pedido.");
        setIsLoading(false);
        return;
      }

      const generarLinkDePago = httpsCallable(functions, "generarLinkDePago");
      const response = await generarLinkDePago({
        carrito: carritoMP,
        mesa: "Mesa 1", // Example metadata
      });

      localStorage.setItem(
        "orderData",
        JSON.stringify({
          name: formData.name,
          email: formData.email,
          pickupTime: formData.pickupTime,
          comments: formData.comments,
          cart,
        })
      );

      window.location.href = response.data.init_point;
    } catch (error) {
      console.error("Error al generar el link de pago:", error);
      alert("No se pudo procesar el pago. Intente más tarde.");
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
