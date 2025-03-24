import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

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

      try {
        const orderData = JSON.parse(localStorage.getItem("orderData"));

        if (!orderData) {
          alert("No se encontraron datos del pedido.");
          setLoading(false);
          return;
        }

        const counterRef = doc(db, "counters", "orders");
        const counterSnap = await getDoc(counterRef);
        let newOrderId = 1;

        if (counterSnap.exists()) {
          newOrderId = counterSnap.data().lastId + 1;
          await updateDoc(counterRef, { lastId: newOrderId });
        } else {
          await setDoc(counterRef, { lastId: newOrderId });
        }

        const total = orderData.cart.reduce(
          (sum, item) => sum + item.precio * item.quantity,
          0
        );

        await addDoc(collection(db, "orders"), {
          orderId: newOrderId,
          name: orderData.name,
          email: orderData.email,
          pickupTime: orderData.pickupTime,
          comments: orderData.comments,
          total,
          items: orderData.cart.map((item) => ({
            nombre: item.nombre,
            cantidad: item.quantity,
            precio: item.precio,
          })),
          timeSubmitted: new Date().toLocaleString(),
          status: "pendiente",
          paymentId,
        });

        localStorage.removeItem("orderData");
        localStorage.removeItem("cart");
        setOrderId(newOrderId);
      } catch (err) {
        console.error("Error al guardar el pedido:", err);
        alert("Hubo un problema al procesar tu pedido.");
      } finally {
        setLoading(false);
      }
    };

    processOrder();
  }, []);

  if (loading) return <p className="text-center mt-10">Procesando pedido...</p>;

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
