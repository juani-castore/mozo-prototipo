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
        const fetched = snapshot.docs
          .map((snap) => {
            const data = snap.data();
            if (!data || typeof data !== "object") return null;

            const pickupTime = String(data.pickupTime ?? "0");
            let timeSubmitted = "Fecha no disponible";
            if (data.timeSubmitted && typeof data.timeSubmitted.toDate === "function") {
              timeSubmitted = data.timeSubmitted.toDate().toLocaleString();
            } else if (typeof data.timeSubmitted === "string") {
              timeSubmitted = data.timeSubmitted;
            }

            const rawStatus = data.status ?? "pendiente";
            const status = rawStatus === "approved" ? "pendiente" : rawStatus;

            return {
              id: snap.id,
              orderId: data.orderId ?? "Sin ID",
              name: data.name ?? "Sin Nombre",
              email: data.email ?? "Sin Email",
              total: data.total ?? 0,
              status,
              items: Array.isArray(data.items) ? data.items : [],
              pickupTime,
              timeSubmitted,
              comments: data.comments ?? "Sin comentarios",
            };
          })
          .filter(Boolean);

        fetched.sort((a, b) => {
          if (a.pickupTime === "0" && b.pickupTime !== "0") return -1;
          if (a.pickupTime !== "0" && b.pickupTime === "0") return 1;
          return a.pickupTime.localeCompare(b.pickupTime);
        });

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

  const handleChangeStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", id), { status: newStatus });
    } catch {}
  };

  if (loading) return <p className="text-center text-gray-600">Cargando pedidos...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const pending = orders.filter((o) => o.status === "pendiente");
  const prepared = orders.filter((o) => o.status === "preparado");
  const delivered = orders
    .filter((o) => o.status === "entregado")
    .sort((a, b) => b.orderId - a.orderId);

  const renderCard = (order, showDeliverBtn = false) => (
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
          {order.items.map((item, i) => (
            <li key={i}>{item.name} (x{item.quantity})</li>
          ))}
        </ul>
      </div>
      {showDeliverBtn && (
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
        {pending.length === 0
          ? <p className="text-center text-gray-600">No hay pedidos pendientes.</p>
          : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{pending.map(o => renderCard(o))}</div>
        }
      </section>

      <section className="mb-8">
        <h3 className="text-2xl font-semibold text-blue-600 mb-4">Preparados</h3>
        {prepared.length === 0
          ? <p className="text-center text-gray-600">No hay pedidos preparados.</p>
          : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{prepared.map(o => renderCard(o, true))}</div>
        }
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-green-600 mb-4">Entregados</h3>
        {delivered.length === 0
          ? <p className="text-center text-gray-600">No hay pedidos entregados.</p>
          : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{delivered.map(o => renderCard(o))}</div>
        }
      </section>
    </div>
  );
};

export default Pedidos;
