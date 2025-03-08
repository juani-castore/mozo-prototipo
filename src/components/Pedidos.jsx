import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const Pedidos = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "pedidos"),
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            orderId: data.orderId || "Sin ID",
            name: data.name || "Sin Nombre",
            email: data.email || "Sin Email",
            total: data.total || 0,
            status: data.status || "pendiente",
            items: Array.isArray(data.items) ? data.items : [],
            pickupTime: data.pickupTime || "0",
            timeSubmitted: data.timeSubmitted || "Fecha no disponible",
            comments: data.comments || "Sin comentarios",
          };
        });

        fetchedOrders.sort((a, b) => {
          if (a.pickupTime === "0" && b.pickupTime !== "0") return -1;
          if (a.pickupTime !== "0" && b.pickupTime === "0") return 1;
          return a.pickupTime.localeCompare(b.pickupTime);
        });

        setOrders(fetchedOrders);
        setLoading(false);
      },
      (err) => {
        console.error("Error al obtener los pedidos:", err);
        setError("Error al cargar los pedidos. Inténtalo de nuevo más tarde.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleChangeStatus = async (id, newStatus) => {
    try {
      const orderRef = doc(db, "pedidos", id);
      await updateDoc(orderRef, { status: newStatus });
    } catch (error) {
      console.error("Error al actualizar el estado del pedido:", error);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-600">Cargando pedidos...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  const pendingOrders = orders.filter((order) => order.status === "pendiente");
  const deliveredOrders = orders
    .filter((order) => order.status === "entregado")
    .sort((a, b) => b.orderId - a.orderId);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center text-brick mb-8">Pedidos Activos</h2>

      <section className="mb-8">
        <h3 className="text-2xl font-semibold text-red-600 mb-4">Pedidos Pendientes</h3>
        {pendingOrders.length === 0 ? (
          <p className="text-center text-gray-600">No hay pedidos pendientes.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingOrders.map((order) => (
              <div key={order.id} className="p-4 bg-white shadow rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-brick mb-2">Pedido #{order.orderId}</h3>
                <p className="text-gray-700 mb-1"><strong>Nombre:</strong> {order.name}</p>
                <p className="text-gray-700 mb-1"><strong>Email:</strong> {order.email}</p>
                <p className="text-gray-700 mb-1"><strong>Total:</strong> ${order.total}</p>
                <p className="text-gray-700 mb-1">
                  <strong>Hora de Retiro:</strong> {order.pickupTime === "0" ? "Retirar Ahora" : order.pickupTime}
                </p>
                <p className="text-gray-700 mb-1"><strong>Fecha y Hora Pedido:</strong> {order.timeSubmitted}</p>
                <p className="text-gray-700 mb-1"><strong>Comentarios:</strong> {order.comments}</p>
                <div className="mt-2">
                  <strong>Items:</strong>
                  {order.items.map((item, index) => (
                    <div key={index} className="ml-2 text-gray-600">
                      • {item.nombre} (x{item.cantidad}) - ${item.precio}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleChangeStatus(order.id, "entregado")}
                  className="w-full bg-green-500 text-white py-2 rounded mt-4 hover:bg-green-600"
                >
                  Marcar como Entregado
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-green-600 mb-4">Pedidos Entregados</h3>
        {deliveredOrders.length === 0 ? (
          <p className="text-center text-gray-600">No hay pedidos entregados.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliveredOrders.map((order) => (
              <div key={order.id} className="p-4 bg-green-100 shadow rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-green-700 mb-2">Pedido #{order.orderId}</h3>
                <p className="text-gray-700 mb-1"><strong>Nombre:</strong> {order.name}</p>
                <p className="text-gray-700 mb-1"><strong>Email:</strong> {order.email}</p>
                <p className="text-gray-700 mb-1"><strong>Total:</strong> ${order.total}</p>
                <p className="text-gray-700 mb-1">
                  <strong>Hora de Retiro:</strong> {order.pickupTime === "0" ? "Retirar Ahora" : order.pickupTime}
                </p>
                <p className="text-gray-700 mb-1"><strong>Fecha y Hora Pedido:</strong> {order.timeSubmitted}</p>
                <p className="text-gray-700 mb-1"><strong>Comentarios:</strong> {order.comments}</p>
                <div className="mt-2">
                  <strong>Items:</strong>
                  {order.items.map((item, index) => (
                    <div key={index} className="ml-2 text-gray-600">
                      • {item.nombre} (x{item.cantidad}) - ${item.precio}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Pedidos;
