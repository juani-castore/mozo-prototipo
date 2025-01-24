import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../CartContext";
import { collection, addDoc, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const Checkout = () => {
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    pickupTime: 0, // Default "Retirar ahora" as 0
    comments: "", // New field for comments
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false); // Toggle for "Programar" option

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.precio * item.quantity, 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePickupTimeChange = (e) => {
    setFormData({ ...formData, pickupTime: e.target.value });
  };

  const toggleScheduling = () => {
    setIsScheduling(!isScheduling);
    setFormData({ ...formData, pickupTime: isScheduling ? 0 : "" }); // Reset pickupTime on toggle
  };

  const getNextOrderId = async () => {
    const counterDocRef = doc(db, "counters", "orders");
    const counterDoc = await getDoc(counterDocRef);

    if (counterDoc.exists()) {
      const currentId = counterDoc.data().lastId;
      await updateDoc(counterDocRef, { lastId: currentId + 1 });
      return currentId + 1;
    } else {
      await setDoc(counterDocRef, { lastId: 1 });
      return 1;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const timeSubmitted = new Date().toLocaleString();

    setIsLoading(true);
    try {
      const orderId = await getNextOrderId();
      const order = {
        orderId,
        name: formData.name,
        email: formData.email,
        pickupTime: formData.pickupTime,
        comments: formData.comments, // Add comments to the order
        total: calculateTotal(),
        items: cart.map((item) => ({
          nombre: item.nombre,
          cantidad: item.quantity,
          precio: item.precio,
        })),
        timeSubmitted,
        status: "pendiente",
      };

      await addDoc(collection(db, "pedidos"), order);
      clearCart();
      navigate("/order-confirmation", { state: { order } });
    } catch (error) {
      console.error("Error al guardar el pedido: ", error);
      alert("Error al procesar el pedido. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center text-brick mb-8">Formulario de Pedido</h2>
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
    </div>
  );
};

export default Checkout;
