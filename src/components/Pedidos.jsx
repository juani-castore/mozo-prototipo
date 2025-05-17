import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  startAfter,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const Pedidos = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [hasNew, setHasNew] = useState(false);
  const [maxShownId, setMaxShownId] = useState(null);
  const loader = useRef(null);

  const fetchInitial = async () => {
    const q = query(
      collection(db, "orders"),
      orderBy("orderId", "desc"),
      limit(50)
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setOrders(data);
    setLastVisible(snap.docs[snap.docs.length - 1]);
    setMaxShownId(data.length > 0 ? data[0].orderId : null);
    setHasMore(snap.docs.length === 50);
    setLoading(false);
  };

  const fetchMore = async () => {
    if (!hasMore || searching || !lastVisible) return;
    const q = query(
      collection(db, "orders"),
      orderBy("orderId", "desc"),
      startAfter(lastVisible),
      limit(50)
    );
    const snap = await getDocs(q);
    const newOrders = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setOrders((prev) => [...prev, ...newOrders]);
    setLastVisible(snap.docs[snap.docs.length - 1]);
    setHasMore(snap.docs.length === 50);
  };

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting) fetchMore();
    },
    [lastVisible, searching]
  );

  useEffect(() => {
    fetchInitial();
  }, []);

  useEffect(() => {
    const option = { root: null, rootMargin: "20px", threshold: 1.0 };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "orders"), orderBy("orderId", "desc"), limit(1)),
      (snapshot) => {
        const latest = snapshot.docs[0]?.data();
        if (latest && latest.orderId > maxShownId) setHasNew(true);
      }
    );
    return () => unsub();
  }, [maxShownId]);

  const handleSearch = async () => {
    setSearching(true);
    setLoading(true);

    let q;
    if (/^\d+$/.test(searchTerm)) {
      q = query(collection(db, "orders"), where("orderId", "==", Number(searchTerm)));
    } else if (searchTerm.includes("@")) {
      q = query(collection(db, "orders"), where("email", "==", searchTerm));
    } else {
      const snap = await getDocs(collection(db, "orders"));
      const filtered = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((o) => o.name?.toLowerCase().includes(searchTerm.toLowerCase()));
      setOrders(filtered);
      setLoading(false);
      return;
    }

    try {
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
    } catch (err) {
      console.error("Error en la búsqueda:", err);
    }

    setLoading(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearching(false);
    setLoading(true);
    setOrders([]);
    setHasNew(false);
    fetchInitial();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-6">Todos los Pedidos</h2>

      <div className="flex justify-center items-center mb-6 gap-2">
        <input
          type="text"
          value={searchTerm}
          placeholder="Buscar por ID, email o nombre"
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-md w-64"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Buscar
        </button>
        {searching && (
          <button
            onClick={clearSearch}
            className="text-sm text-gray-600 underline ml-2"
          >
            Limpiar
          </button>
        )}
      </div>

      {hasNew && !searching && (
        <div className="text-center mb-4">
          <button
            onClick={clearSearch}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded shadow"
          >
            🔄 Hay nuevos pedidos - Cargar
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-center">Cargando pedidos...</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-500">No se encontraron pedidos.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`p-4 border rounded-lg shadow ${
                order.printed ? "bg-green-100" : "bg-yellow-100"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold text-brick">
                  Pedido #{order.orderId}
                </h3>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full ${
                    order.printed ? "bg-green-500" : "bg-yellow-500"
                  } text-white`}
                >
                  {order.printed ? "IMPRESO" : "NO IMPRESO"}
                </span>
              </div>
              <p><strong>Nombre:</strong> {order.name}</p>
              <p><strong>Email:</strong> {order.email}</p>
              <p><strong>Total:</strong> ${order.total?.toFixed(2)}</p>
              <p><strong>Retiro:</strong> {order.pickupTime || "ahora"}</p>
              <p><strong>Comentarios:</strong> {order.comments || "-"}</p>
              <p className="text-sm text-gray-600 mt-1">
                {order.timeSubmitted?.toDate?.() instanceof Date
                  ? `Enviado: ${order.timeSubmitted.toDate().toLocaleString()}`
                  : ""}
              </p>
              <div className="mt-2">
                <strong>Items:</strong>
                <ul className="list-disc pl-5">
                  {order.items?.map((item, i) => (
                    <li key={i}>
                      {item.quantity} × {item.name} (${item.price})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {!searching && <div ref={loader} className="h-10" />}
    </div>
  );
};

export default Pedidos;
