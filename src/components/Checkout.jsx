import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../CartContext";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const Checkout = () => {
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    pickupTime: "now", // Por defecto "ahora mismo"
  });
  const [isLoading, setIsLoading] = useState(false);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.precio * item.quantity, 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    const timeSubmitted = new Date().toLocaleString(); // Hora actual

    setIsLoading(true);
    try {
      const orderId = await getNextOrderId(); // Obtén el próximo ID incremental
      const order = {
        orderId, // Usamos el ID incremental
        name: formData.name,
        email: formData.email,
        pickupTime: formData.pickupTime,
        total: calculateTotal(),
        items: cart.map((item) => ({
          nombre: item.nombre,
          cantidad: item.quantity,
          precio: item.precio,
        })),
        timeSubmitted,
        status: "pendiente", // Estado inicial del pedido
      };

      // Guarda el pedido en Firestore
      await addDoc(collection(db, "pedidos"), order);

      // Limpiar carrito y redirigir con el order
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
    <div className="container">
      <h2>Formulario de Pedido</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Nombre completo:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Correo electrónico:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Hora de retiro:</label>
          <input
            type="text"
            name="pickupTime"
            value={formData.pickupTime}
            placeholder="Ej: 14:00 o ahora mismo"
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          style={{ width: "100%", padding: "0.7rem", marginTop: "1rem" }}
        >
          {isLoading ? "Procesando..." : "Confirmar Pedido"}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
