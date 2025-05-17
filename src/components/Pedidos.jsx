import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

const Pedidos = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        const fetched = snapshot.docs
          .map((snap) => {
            const data = snap.data();
            if (!data || typeof data !== "object") return null;

            let timeSubmitted = "Fecha no disponible";
            if (data.timeSubmitted && typeof data.timeSubmitted.toDate === "function") {
              timeSubmitted = data.timeSubmitted.toDate().toLocaleString();
            } else if (typeof data.timeSubmitted === "string") {
              timeSubmitted = data.timeSubmitted;
            }

            return {
              id: snap.id,
              orderId: data.orderId ?? "Sin ID",
              name: data.name ?? "Sin Nombre",
              email: data.email ?? "Sin Email",
              total: data.total ?? 0,
              items: Array.isArray(data.items) ? data.items : [],
              pickupTime: String(data.pickupTime ?? "0"),
              timeSubmitted,
              comments: data.comments ?? "Sin comentarios",
              printed: !!data.printed,
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.orderId - a.orderId); // Más recientes primero

        setOrders(fetched);
        setLoading(false);
      },
      () => {
        setError("Error al cargar los pedidos. Inténtalo de nuevo más tarde.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) return <p className="text-center text-gray-600">Cargando pedidos...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">Todos los Pedidos</h2>

      {orders.length === 0 ? (
        <p className="text-center text-gray-600">No hay pedidos registrados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`p-4 rounded-lg border shadow ${
                order.printed ? "bg-green-100" : "bg-yellow-100"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold text-brick">
                  Pedido #{order.orderId}
                </h3>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full ${
                    order.printed ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
                  }`}
                >
                  {order.printed ? "IMPRESO" : "NO IMPRESO"}
                </span>
              </div>
              <p><strong>Nombre:</strong> {order.name}</p>
              <p><strong>Email:</strong> {order.email}</p>
              <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
              <p><strong>Hora de retiro:</strong> {order.pickupTime === "0" ? "Retirar ahora" : order.pickupTime}</p>
              <p><strong>Enviado a las:</strong> {order.timeSubmitted}</p>
              <p><strong>Comentarios:</strong> {order.comments}</p>
              <div className="mt-2">
                <strong>Items:</strong>
                <ul className="list-disc pl-5">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      {item.name} × {item.quantity} (${item.price})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pedidos;
