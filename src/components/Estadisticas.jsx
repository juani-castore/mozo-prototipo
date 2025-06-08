// src/components/Estadisticas.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const COMISION = 0.05;

const Estadisticas = () => {
  const [totalesPorDia, setTotalesPorDia] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [ticketPromedio, setTicketPromedio] = useState(0);
  const [productosVendidos, setProductosVendidos] = useState([]);
  const [ingresosPorDiaSemana, setIngresosPorDiaSemana] = useState({});
  const [ingresoBrutoTotal, setIngresoBrutoTotal] = useState(0);

  useEffect(() => {
    const fetchPedidos = async () => {
      const snapshot = await getDocs(collection(db, "orders"));
      const pedidos = snapshot.docs.map((doc) => doc.data());

      const agrupado = {};
      const productos = {};
      const diasSemana = {};
      let totalIngresos = 0;

      pedidos.forEach((pedido) => {
        if (!pedido.timeSubmitted?.toDate) return;
        const fechaObj = pedido.timeSubmitted.toDate();
        const fecha = fechaObj.toISOString().slice(0, 10);
        const dia = fechaObj.getDay();

        agrupado[fecha] = agrupado[fecha] || { bruto: 0, neto: 0, pedidos: 0 };
        agrupado[fecha].bruto += pedido.total;
        agrupado[fecha].neto += pedido.total * (1 - COMISION);
        agrupado[fecha].pedidos += 1;

        totalIngresos += pedido.total;

        diasSemana[dia] = diasSemana[dia] || { total: 0, count: 0 };
        diasSemana[dia].total += pedido.total;
        diasSemana[dia].count += 1;

        pedido.items.forEach((item) => {
          productos[item.name] = (productos[item.name] || 0) + item.quantity;
        });
      });

      setTotalesPorDia(agrupado);
      setFechasDisponibles(Object.keys(agrupado).sort().reverse());
      setTotalPedidos(pedidos.length);
      setTicketPromedio(pedidos.length ? totalIngresos / pedidos.length : 0);
      setIngresoBrutoTotal(totalIngresos);

      const productosOrdenados = Object.entries(productos)
        .sort((a, b) => b[1] - a[1])
        .map(([nombre, cantidad]) => ({ nombre, cantidad }));
      setProductosVendidos(productosOrdenados);

      const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      const resumen = {};
      for (let i = 0; i < 7; i++) {
        if (diasSemana[i]) {
          resumen[dias[i]] = diasSemana[i].total / diasSemana[i].count;
        } else {
          resumen[dias[i]] = 0;
        }
      }
      setIngresosPorDiaSemana(resumen);
    };

    fetchPedidos();
  }, []);

  const datosFiltrados = Object.entries(totalesPorDia)
    .filter(([fecha]) => fecha.includes(busqueda))
    .sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-4xl font-extrabold text-center text-brick mb-10 uppercase tracking-wide">Estadísticas de Ventas</h2>

      <div className="grid gap-6 max-w-4xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg shadow">
          <h3 className="text-2xl font-semibold text-yellow-700 mb-2">Resumen General</h3>
          <p className="text-gray-700">Total de pedidos: <strong>{totalPedidos}</strong></p>
          <p className="text-gray-700">Ingreso bruto total: <strong>${ingresoBrutoTotal.toFixed(2)}</strong></p>
          <p className="text-gray-700">Ticket promedio: <strong>${ticketPromedio.toFixed(2)}</strong></p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg shadow">
          <h3 className="text-2xl font-semibold text-blue-700 mb-2">Promedio por día de la semana</h3>
          <ul className="text-gray-700 list-disc list-inside">
            {Object.entries(ingresosPorDiaSemana).map(([dia, promedio]) => (
              <li key={dia}><strong>{dia}:</strong> ${promedio.toFixed(2)}</li>
            ))}
          </ul>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg shadow">
          <h3 className="text-2xl font-semibold text-green-700 mb-2">Productos más vendidos</h3>
          <ul className="text-gray-700 list-decimal list-inside">
            {productosVendidos.map((producto, index) => (
              <li key={index}>{producto.nombre}: {producto.cantidad} unidades</li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Ingresos por Día</h3>

          <div className="mb-6 text-center">
            <input
              list="fechas"
              type="text"
              placeholder="Buscar por fecha (yyyy-mm-dd)"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="px-4 py-2 border-2 border-brick-light rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-brick"
            />
            <datalist id="fechas">
              {fechasDisponibles.map((fecha) => (
                <option key={fecha} value={fecha} />
              ))}
            </datalist>
          </div>

          {datosFiltrados.map(([fecha, valores]) => (
            <div key={fecha} className="mb-4 pb-2 border-b">
              <p className="text-xl font-bold text-brick-light">{fecha}</p>
              <p className="text-gray-700">Total bruto: <strong>${valores.bruto.toFixed(2)}</strong></p>
              <p className="text-gray-700">Total neto: <strong>${valores.neto.toFixed(2)}</strong></p>
              <p className="text-gray-700">Pedidos: <strong>{valores.pedidos}</strong></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;