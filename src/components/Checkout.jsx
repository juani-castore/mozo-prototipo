import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../CartContext";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db, functions } from "../firebaseConfig";
import { httpsCallable } from "firebase/functions";

const Checkout = () => {



  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const testFirestore = async () => {
    try {
      const docRef = await addDoc(collection(db, "test"), {
        nombre: "Juan",
        creado: new Date().toISOString(),
      });
      console.log("✅ Documento creado con ID:", docRef.id);
      alert("✅ Firestore conectado correctamente. ID: " + docRef.id);
    } catch (err) {
      console.error("❌ Error en testFirestore:", err);
      alert("❌ Error al conectar con Firestore. Revisá la consola.");
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    pickupTime: 0,
    comments: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePickupTimeChange = (e) => {
    setFormData((prev) => ({ ...prev, pickupTime: e.target.value }));
  };

  const toggleScheduling = () => {
    setIsScheduling((prev) => !prev);
    setFormData((prev) => ({
      ...prev,
      pickupTime: isScheduling ? 0 : "",
    }));
  };

  const handleSubmit = async (e) => {
    
    e.preventDefault();
    setIsLoading(true);

    if (cart.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }
    

    try {
      const carritoMP = cart.map((item) => ({
        nombre: item.nombre,
        precio: Number(item.precio),
        quantity: Number(item.quantity),
      }));

      const generarLinkDePago = httpsCallable(functions, "generarLinkDePago");
      const response = await generarLinkDePago({
        nombre: formData.name,
        email: formData.email,
        carrito: carritoMP,
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
          <div className="flex items-center justify-between">
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-l-lg text-sm font-semibold ${
                !isScheduling
                  ? "bg-brick text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={toggleScheduling}
            >
              Retirar ahora
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-r-lg text-sm font-semibold ${
                isScheduling
                  ? "bg-brick text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={toggleScheduling}
            >
              Programar
            </button>
          </div>
        </div>

        {isScheduling && (
          <div className="mt-4">
            <label className="block text-sm font-bold mb-2 text-gray-700">
              Selecciona un horario
            </label>
            <input
              type="time"
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handlePickupTimeChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-brick-light"
            />
          </div>
        )}

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

      {import.meta.env.DEV && (
        <div className="mt-4 text-center">
          <button
            onClick={testFirestore}
            type="button"
            className="text-xs text-blue-600 underline"
          >
            Probar conexión con Firestore
          </button>
        </div>
      )}
    </div>
  );
};

export default Checkout;
