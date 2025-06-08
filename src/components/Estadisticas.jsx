// src/components/Estadisticas.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Comisión global modificable
const COMISION = 0.05;

const Estadisticas = () => {
  const [dias, setDias] = useState(7);
  const [datos, setDatos] = useState([]);
  const [filtrados, setFiltrados] = useState([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      const snapshot = await getDocs(collection(db, "orders"));
      const pedidos = snapshot.docs.map((doc) => doc.data());

      const agrupado = {};

      pedidos.forEach((pedido) => {
        if (!pedido.timeSubmitted?.toDate) return;
        const fecha = pedido.timeSubmitted.toDate().toISOString().slice(0, 10);
        if (!agrupado[fecha]) {
          agrupado[fecha] = {
            bruto: 0,
            neto: 0,
            pedidos: 0,
            items: 0,
          };
        }

        agrupado[fecha].bruto += pedido.total;
        agrupado[fecha].neto += pedido.total * (1 - COMISION);
        agrupado[fecha].pedidos += 1;
        agrupado[fecha].items += pedido.items.reduce(
          (sum, i) => sum + i.quantity,
          0
        );
      });

      const transformado = Object.entries(agrupado)
        .map(([fecha, valores]) => ({ fecha, ...valores }))
        .sort((a, b) => a.fecha.localeCompare(b.fecha));

      setDatos(transformado);
    };

    fetchPedidos();
  }, []);

  useEffect(() => {
    const hasta = new Date();
    const desde = new Date();
    desde.setDate(hasta.getDate() - dias + 1);
    const filtrado = datos.filter((d) => {
      const f = new Date(d.fecha);
      return f >= desde && f <= hasta;
    });
    setFiltrados(filtrado);
  }, [datos, dias]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center text-brick mb-6">
        Estadísticas de Ventas
      </h2>

      <div className="mb-6 text-center">
        <label className="mr-2 font-semibold">Mostrar últimos</label>
        <select
          value={dias}
          onChange={(e) => setDias(Number(e.target.value))}
          className="px-2 py-1 border rounded"
        >
          {[3, 7, 14, 30].map((d) => (
            <option key={d} value={d}>
              {d} días
            </option>
          ))}
        </select>
      </div>

      {/* Gráfico: Cantidad de productos vendidos */}
      <h3 className="text-xl font-semibold text-center mb-2">
        Productos Vendidos por Día
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filtrados} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <Line type="monotone" dataKey="items" stroke="#CC603B" strokeWidth={2} />
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="fecha" />
          <YAxis />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>

      {/* Gráfico: Ingresos netos */}
      <h3 className="text-xl font-semibold text-center mt-8 mb-2">
        Ingresos Netos por Día
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filtrados} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <Line type="monotone" dataKey="neto" stroke="#CCA43B" strokeWidth={2} />
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="fecha" />
          <YAxis />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>

      {/* Lista diaria */}
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6 mt-8">
        {filtrados
          .slice()
          .reverse()
          .map((d) => (
            <div key={d.fecha} className="mb-4 border-b pb-2">
              <p className="text-xl font-semibold">{d.fecha}</p>
              <p>Total bruto: ${d.bruto.toFixed(2)}</p>
              <p>Total neto: ${d.neto.toFixed(2)}</p>
              <p>Pedidos: {d.pedidos}</p>
              <p>Items vendidos: {d.items}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Estadisticas;
