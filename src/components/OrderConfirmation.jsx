// src/components/OrderConfirmation.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const OrderConfirmation = () => {
  const [params] = useSearchParams();
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processOrder = async () => {
      const paymentId = params.get("payment_id");
      if (!paymentId) {
        alert("Pago no válido.");
        setLoading(false);
        return;
      }

      const orderData = JSON.parse(localStorage.getItem("orderData"));
      if (!orderData) {
        alert("No se encontraron datos del pedido.");
        setLoading(false);
        return;
      }

      try {
        // Confirmar pago
        const response = await fetch("https://us-central1-prototipo-mozo.cloudfunctions.net/confirmarPago", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payment_id: paymentId, orderData }),
        });

        if (!response.ok) {
          throw new Error("Error al confirmar el pago");
        }

        const data = await response.json();
        setOrderId(data.orderId);

        // Descontar stock con nueva función backend
        try {
          await fetch("https://us-central1-prototipo-mozo.cloudfunctions.net/descontarStock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: orderData.cart }),
          });
        } catch (err) {
          console.warn("⚠️ No se pudo descontar stock:", err);
        }

        // Limpiar localStorage
        localStorage.removeItem("orderData");
        localStorage.removeItem("cart");
      } catch (error) {
        console.error("Error confirmando el pago:", error);
        alert("Hubo un problema al confirmar tu pago.");
      } finally {
        setLoading(false);
      }
    };

    processOrder();
  }, [params]);

  if (loading) {
    return <p className="text-center mt-10">Procesando pedido...</p>;
  }

  return (
    <div className="max-w-lg mx-auto mt-10 text-center">
      <h1 className="text-2xl font-bold text-green-700 mb-4">¡Gracias por tu compra!</h1>
      <p className="text-lg">Tu número de pedido es:</p>
      <h2 className="text-4xl font-bold text-brick my-4">{orderId}</h2>
      <p className="text-sm text-gray-600">Guardá este número o sacale una captura.</p>
    </div>
  );
};

export default OrderConfirmation;
