import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const CocinaDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            orderId: data.orderId || 'Sin ID',
            status: data.status || 'pendiente',
            items: Array.isArray(data.items) ? data.items : [],
            pickupTime: data.pickupTime || '0',
            comments: data.comments || '',
          };
        });

        fetchedOrders.sort((a, b) => {
          const timeA = a.pickupTime === '0' ? '00:00' : a.pickupTime;
          const timeB = b.pickupTime || '0';
          return timeA.localeCompare(timeB);
        });

        setOrders(fetchedOrders.filter(order => order.status !== 'preparado' && order.status !== 'entregado'));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleChangeStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status: newStatus });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  if (loading) return <p className="text-center">Cargando pedidos...</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Pedidos en Cocina</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white shadow-lg rounded p-4 border">
            <h3 className="text-xl font-semibold mb-2">Pedido #{order.orderId}</h3>
            <p><strong>Hora Retiro:</strong> {order.pickupTime === "0" ? "Inmediato" : order.pickupTime}</p>

            <div className="mt-2">
              <strong>Items:</strong>
              <ul className="list-disc pl-5">
                {order.items.map((item, index) => (
                  <li key={index}>{item.nombre} (x{item.cantidad})</li>
                ))}
              </ul>
            </div>

            {order.comments && <p className="italic mt-2">"{order.comments}"</p>}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleChangeStatus(order.id, "en preparación")}
                disabled={order.status !== 'pendiente'}
                className={`flex-1 py-2 px-4 rounded text-white ${order.status === 'pendiente' ? 'bg-yellow-500' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                En Preparación
              </button>
              <button
                onClick={() => handleChangeStatus(order.id, "preparado")}
                disabled={order.status !== 'en preparación'}
                className={`flex-1 py-2 px-4 rounded text-white ${order.status === 'en preparación' ? 'bg-green-500' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                Listo
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CocinaDashboard;
