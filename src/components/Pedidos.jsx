import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const Pedidos = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "orders"),
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
      await updateDoc(doc(db, "orders", id), { status: newStatus });
    } catch (error) {
      console.error("Error al actualizar el estado del pedido:", error);
    }
  };

  if (loading) return <p className="text-center text-gray-600">Cargando pedidos...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const pendingOrders = orders.filter(order => order.status === "pendiente");
  const preparedOrders = orders.filter(order => order.status === "preparado");
  const deliveredOrders = orders.filter(order => order.status === "entregado").sort((a, b) => b.orderId - a.orderId);

  const renderOrderCard = (order, showDeliverButton = false) => (
    <div key={order.id} className="p-4 bg-white shadow rounded-lg border border-gray-200">
      <h3 className="text-xl font-semibold mb-2">Pedido #{order.orderId}</h3>
      <p><strong>Nombre:</strong> {order.name}</p>
      <p><strong>Email:</strong> {order.email}</p>
      <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
      <p><strong>Hora de Retiro:</strong> {order.pickupTime === "0" ? "Retirar Ahora" : order.pickupTime}</p>
      <p><strong>Enviado a las:</strong> {order.timeSubmitted}</p>
      <p><strong>Comentarios:</strong> {order.comments}</p>
      <div className="mt-2">
        <strong>Items:</strong>
        <ul className="list-disc pl-5">
          {order.items.map((item, index) => (
            <li key={index}>{item.name} (x{item.quantity})</li>
          ))}
        </ul>
      </div>
      {showDeliverButton && (
        <button
          onClick={() => handleChangeStatus(order.id, "entregado")}
          className="w-full bg-green-500 text-white py-2 rounded mt-4 hover:bg-green-600"
        >
          Marcar como Entregado
        </button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">Pedidos Activos</h2>

      <section className="mb-8">
        <h3 className="text-2xl font-semibold text-red-600 mb-4">Pendientes</h3>
        {pendingOrders.length === 0 ? (
          <p className="text-center text-gray-600">No hay pedidos pendientes.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingOrders.map(order => renderOrderCard(order))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <h3 className="text-2xl font-semibold text-blue-600 mb-4">Preparados</h3>
        {preparedOrders.length === 0 ? (
          <p className="text-center text-gray-600">No hay pedidos preparados.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {preparedOrders.map(order => renderOrderCard(order, true))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-green-600 mb-4">Entregados</h3>
        {deliveredOrders.length === 0 ? (
          <p className="text-center text-gray-600">No hay pedidos entregados.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliveredOrders.map(order => renderOrderCard(order))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Pedidos;
