// src/components/OrderConfirmation.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebaseConfig";

const OrderConfirmation = () => {
  const [params] = useSearchParams();
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processOrder = async () => {
      // 1. Leer el payment_id que MercadoPago nos devuelve en la URL
      const paymentId = params.get("payment_id");
      if (!paymentId) {
        alert("Pago no válido.");
        setLoading(false);
        return;
      }

      // 2. Recuperar del localStorage el orderData que guardamos antes de redirigir
      const orderData = JSON.parse(localStorage.getItem("orderData"));
      if (!orderData) {
        alert("No se encontraron datos del pedido.");
        setLoading(false);
        return;
      }

      try {
        // 3. Invocar la Cloud Function confirmarPago
        const confirmarPago = httpsCallable(functions, "confirmarPago");
        const { data } = await confirmarPago({
          payment_id: paymentId,
          orderData,
        });

        // 4. Poner el nuevo orderId en estado y limpiar el storage
        setOrderId(data.orderId);
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
      <h1 className="text-2xl font-bold text-green-700 mb-4">
        ¡Gracias por tu compra!
      </h1>
      <p className="text-lg">Tu número de pedido es:</p>
      <h2 className="text-4xl font-bold text-brick my-4">{orderId}</h2>
      <p className="text-sm text-gray-600">
        Guardá este número o sacale una captura.
      </p>
    </div>
  );
};

export default OrderConfirmation;
