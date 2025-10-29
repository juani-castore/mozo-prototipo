// src/components/Estadisticas.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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
  const [ventasPorHora, setVentasPorHora] = useState({});
  const [rentabilidadProductos, setRentabilidadProductos] = useState([]);
  const [margenCostoGlobal, setMargenCostoGlobal] = useState(35);
  const [margenesIndividuales, setMargenesIndividuales] = useState({});
  const [datosBase, setDatosBase] = useState({});
  const [editandoProducto, setEditandoProducto] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [excluirFinesDeSemana, setExcluirFinesDeSemana] = useState(false);

  // Nuevo: estados para secciones plegables (agregamos graficos)
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({
    resumen: true,
    diasSemana: false,
    productos: false,
    franjas: true,
    rentabilidad: true,
    graficos: true, // Nueva sección
    ingresosPorDia: false
  });

  // Función para toggle secciones
  const toggleSeccion = (seccion) => {
    setSeccionesAbiertas(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }));
  };

  useEffect(() => {
    const fetchPedidos = async () => {
      const snapshot = await getDocs(collection(db, "orders"));
      const pedidos = snapshot.docs.map((doc) => doc.data());

      const agrupado = {};
      const productos = {};
      const productosRentabilidad = {};
      const diasSemana = {};
      const horasVenta = {};
      let totalIngresos = 0;

      pedidos.forEach((pedido) => {
        if (!pedido.timeSubmitted?.toDate) return;
        const fechaObj = pedido.timeSubmitted.toDate();
        const fecha = fechaObj.toISOString().slice(0, 10);
        const dia = fechaObj.getDay();
        const hora = fechaObj.getHours();

        agrupado[fecha] = agrupado[fecha] || { bruto: 0, neto: 0, pedidos: 0 };
        agrupado[fecha].bruto += pedido.total;
        agrupado[fecha].neto += pedido.total * (1 - COMISION);
        agrupado[fecha].pedidos += 1;

        totalIngresos += pedido.total;

        diasSemana[dia] = diasSemana[dia] || { total: 0, count: 0 };
        diasSemana[dia].total += pedido.total;
        diasSemana[dia].count += 1;

        horasVenta[hora] = horasVenta[hora] || { total: 0, pedidos: 0 };
        horasVenta[hora].total += pedido.total;
        horasVenta[hora].pedidos += 1;

        pedido.items.forEach((item) => {
          productos[item.name] = (productos[item.name] || 0) + item.quantity;
          
          if (!productosRentabilidad[item.name]) {
            productosRentabilidad[item.name] = {
              cantidad: 0,
              ingresoTotal: 0,
              precio: item.price || 0,
            };
          }
          productosRentabilidad[item.name].cantidad += item.quantity;
          productosRentabilidad[item.name].ingresoTotal += (item.price || 0) * item.quantity;
        });
      });

      setDatosBase(productosRentabilidad);
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
      setVentasPorHora(horasVenta);
    };

    fetchPedidos();
  }, []);

  useEffect(() => {
    if (Object.keys(datosBase).length === 0) return;

    const rentabilidad = Object.entries(datosBase).map(([nombre, datos]) => {
      const margenUsar = margenesIndividuales[nombre] !== undefined 
        ? margenesIndividuales[nombre] 
        : margenCostoGlobal;
      
      const costoEstimado = datos.precio * (margenUsar / 100);
      const costoTotal = costoEstimado * datos.cantidad;
      const gananciaBruta = datos.ingresoTotal - costoTotal;
      const margenPorcentaje = datos.ingresoTotal > 0 ? (gananciaBruta / datos.ingresoTotal) * 100 : 0;
      
      return {
        nombre,
        cantidad: datos.cantidad,
        ingresoTotal: datos.ingresoTotal,
        costoTotal,
        gananciaBruta,
        margenPorcentaje,
        precioUnitario: datos.precio,
        costoUnitario: costoEstimado,
        gananciaUnitaria: datos.precio - costoEstimado,
        margenCostoUsado: margenUsar,
        tieneMargenPersonalizado: margenesIndividuales[nombre] !== undefined
      };
    }).sort((a, b) => b.gananciaBruta - a.gananciaBruta);

    setRentabilidadProductos(rentabilidad);
  }, [datosBase, margenCostoGlobal, margenesIndividuales]);

  // Inicializar fechas por defecto cuando cargan los totales por día
  useEffect(() => {
    const fechas = Object.keys(totalesPorDia).sort(); // ascendente
    const hoy = new Date().toISOString().slice(0, 10);
    if (fechas.length === 0) {
      setFechaInicio(hoy);
      setFechaFin(hoy);
      return;
    }

    const primer = fechas[0];
    // Por defecto inicio = primer día disponible, fin = hoy
    setFechaInicio(primer);
    setFechaFin(hoy);
  }, [totalesPorDia]);

  // Mejoradas: funciones para manejar márgenes
  const handleMargenGlobalChange = (e) => {
    const valor = parseFloat(e.target.value);
    if (!isNaN(valor) && valor >= 0 && valor <= 100) {
      setMargenCostoGlobal(valor);
    }
  };

  const handleMargenIndividualChange = (nombreProducto, valor) => {
    const valorNum = parseFloat(valor);
    if (!isNaN(valorNum) && valorNum >= 0 && valorNum <= 100) {
      setMargenesIndividuales(prev => ({
        ...prev,
        [nombreProducto]: valorNum
      }));
    } else if (valor === '' || valor === null) {
      // Eliminar margen personalizado
      setMargenesIndividuales(prev => {
        const nuevo = { ...prev };
        delete nuevo[nombreProducto];
        return nuevo;
      });
    }
    setEditandoProducto(null);
  };

  const aplicarMargenGlobalATodos = () => {
    setMargenesIndividuales({});
  };

  // Nueva función para obtener color según margen
  const getColorMargen = (margen) => {
    if (margen >= 70) return 'bg-green-100 border-green-500 text-green-700';
    if (margen >= 50) return 'bg-blue-100 border-blue-500 text-blue-700';
    if (margen >= 30) return 'bg-yellow-100 border-yellow-500 text-yellow-700';
    return 'bg-red-100 border-red-500 text-red-700';
  };

  // Nueva función para obtener el rango de horas
  const getRangoHora = (hora) => {
    return `${hora.toString().padStart(2, '0')}:00 - ${(hora + 1).toString().padStart(2, '0')}:00`;
  };

  // Nueva función para identificar franjas críticas
  const getColorFranja = (pedidos, maxPedidos) => {
    const porcentaje = (pedidos / maxPedidos) * 100;
    if (porcentaje >= 80) return 'bg-red-100 border-red-500 text-red-700';
    if (porcentaje >= 60) return 'bg-orange-100 border-orange-500 text-orange-700';
    if (porcentaje >= 40) return 'bg-yellow-100 border-yellow-500 text-yellow-700';
    return 'bg-green-100 border-green-500 text-green-700';
  };

  // NUEVAS FUNCIONES PARA GRÁFICOS
  
  // Gráfico de barras: Ventas por día de la semana
  const getGraficoDiasSemana = () => {
    const dias = Object.keys(ingresosPorDiaSemana);
    const valores = Object.values(ingresosPorDiaSemana);

    return {
      labels: dias,
      datasets: [
        {
          label: 'Promedio de Ventas ($)',
          data: valores,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 205, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(199, 199, 199, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  

  // Gráfico de línea: Evolución de ventas a lo largo del tiempo (neto y cantidad)
  const getGraficoEvolucionVentas = () => {
    // totalesPorDia tiene la estructura { 'YYYY-MM-DD': { bruto, neto, pedidos } }
    const filas = Object.entries(totalesPorDia);
    // Filtrar por rango si hay valores
    let filasFiltradas = filas;
    if (fechaInicio || fechaFin) {
      const start = fechaInicio || '0000-01-01';
      const end = fechaFin || new Date().toISOString().slice(0, 10);
      filasFiltradas = filas.filter(([fecha]) => fecha >= start && fecha <= end);
    }

    // Excluir fines de semana si la opción está activada
    if (excluirFinesDeSemana) {
      filasFiltradas = filasFiltradas.filter(([fecha]) => {
        // Crear fecha sin zona horaria para evitar desplazamientos
        const d = new Date(fecha + 'T00:00:00');
        const day = d.getDay(); // 0 = Domingo, 6 = Sábado
        return day !== 0 && day !== 6;
      });
    }

    const filasOrdenadas = filasFiltradas.sort((a, b) => a[0].localeCompare(b[0])); // ascendente por fecha

    const labels = filasOrdenadas.map(([fecha]) => fecha);
    const pedidosSeries = filasOrdenadas.map(([, datos]) => datos.pedidos || 0);
    const ventasNetasSeries = filasOrdenadas.map(([, datos]) => Number((datos.neto || 0).toFixed(2)));

    return {
      labels,
      datasets: [
        {
          label: 'Cantidad de pedidos',
          data: pedidosSeries,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          yAxisID: 'y',
          tension: 0.2,
          fill: true,
        },
        {
          label: 'Ventas netas ($)',
          data: ventasNetasSeries,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.08)',
          yAxisID: 'y1',
          tension: 0.2,
          fill: false,
        },
      ],
    };
  };

  const opcionesEvolucionVentas = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Evolución de Ventas: Neto y Cantidad'
      },
      legend: {
        position: 'top'
      }
    },
    scales: {
      x: {
        display: true,
        title: { display: true, text: 'Fecha' }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Cantidad de pedidos' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Ventas netas ($)' },
        grid: { drawOnChartArea: false }
      }
    }
  };

  // Gráfico de línea: Evolución ACUMULADA de ventas (neto y cantidad)
  const getGraficoEvolucionAcumulada = () => {
    // Reutilizar la misma lógica de filtrado que en getGraficoEvolucionVentas
    const filas = Object.entries(totalesPorDia);
    let filasFiltradas = filas;
    if (fechaInicio || fechaFin) {
      const start = fechaInicio || '0000-01-01';
      const end = fechaFin || new Date().toISOString().slice(0, 10);
      filasFiltradas = filas.filter(([fecha]) => fecha >= start && fecha <= end);
    }

    if (excluirFinesDeSemana) {
      filasFiltradas = filasFiltradas.filter(([fecha]) => {
        const d = new Date(fecha + 'T00:00:00');
        const day = d.getDay();
        return day !== 0 && day !== 6;
      });
    }

    const filasOrdenadas = filasFiltradas.sort((a, b) => a[0].localeCompare(b[0]));

    const labels = filasOrdenadas.map(([fecha]) => fecha);
    
    // Calcular series acumuladas
    let acumPedidos = 0;
    let acumVentasNetas = 0;
    const pedidosAcumulados = [];
    const ventasNetasAcumuladas = [];

    filasOrdenadas.forEach(([, datos]) => {
      acumPedidos += datos.pedidos || 0;
      acumVentasNetas += datos.neto || 0;
      pedidosAcumulados.push(acumPedidos);
      ventasNetasAcumuladas.push(Number(acumVentasNetas.toFixed(2)));
    });

    return {
      labels,
      datasets: [
        {
          label: 'Cantidad acumulada de pedidos',
          data: pedidosAcumulados,
          borderColor: 'rgb(139, 92, 246)',
          backgroundColor: 'rgba(139, 92, 246, 0.08)',
          yAxisID: 'y',
          tension: 0.2,
          fill: true,
        },
        {
          label: 'Ventas netas acumuladas ($)',
          data: ventasNetasAcumuladas,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          yAxisID: 'y1',
          tension: 0.2,
          fill: false,
        },
      ],
    };
  };

  const opcionesEvolucionAcumulada = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Evolución Acumulada: Neto y Cantidad'
      },
      legend: {
        position: 'top'
      }
    },
    scales: {
      x: {
        display: true,
        title: { display: true, text: 'Fecha' }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Cantidad acumulada de pedidos' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Ventas netas acumuladas ($)' },
        grid: { drawOnChartArea: false }
      }
    }
  };

  // Gráfico de dona: Top productos más vendidos
  const getGraficoProductos = () => {
    const top10 = productosVendidos.slice(0, 10);
    
    return {
      labels: top10.map(p => p.nombre),
      datasets: [
        {
          data: top10.map(p => p.cantidad),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
          ],
          hoverBackgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
          ],
        },
      ],
    };
  };

  // Gráfico de barras: Rentabilidad por producto
  const getGraficoRentabilidad = () => {
    const top10 = rentabilidadProductos.slice(0, 10);
    
    return {
      labels: top10.map(p => p.nombre.length > 15 ? p.nombre.substring(0, 15) + '...' : p.nombre),
      datasets: [
        {
          label: 'Ingresos ($)',
          data: top10.map(p => p.ingresoTotal),
          backgroundColor: 'rgba(34, 197, 94, 0.6)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
        },
        {
          label: 'Costos ($)',
          data: top10.map(p => p.costoTotal),
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
        },
        {
          label: 'Ganancia ($)',
          data: top10.map(p => p.gananciaBruta),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Configuraciones de gráficos
  const opcionesBasicas = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };
  

  const datosFiltrados = Object.entries(totalesPorDia)
    .filter(([fecha]) => fecha.includes(busqueda))
    .sort((a, b) => b[0].localeCompare(a[0]));

  const maxPedidosHora = Math.max(...Object.values(ventasPorHora).map(h => h.pedidos));
  const horasOrdenadas = Object.entries(ventasPorHora)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-4xl font-extrabold text-center text-brick mb-10 uppercase tracking-wide">Estadísticas de Ventas</h2>

      <div className="grid gap-6 max-w-6xl mx-auto">
        
        {/* Resumen General - Plegable */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg shadow">
          <div 
            className="flex justify-between items-center p-6 cursor-pointer hover:bg-yellow-100 transition-colors"
            onClick={() => toggleSeccion('resumen')}
          >
            <h3 className="text-2xl font-semibold text-yellow-700">📊 Resumen General</h3>
            <span className="text-yellow-700 font-bold text-xl">
              {seccionesAbiertas.resumen ? '−' : '+'}
            </span>
          </div>
          {seccionesAbiertas.resumen && (
            <div className="px-6 pb-6">
              <p className="text-gray-700">Total de pedidos: <strong>{totalPedidos}</strong></p>
              <p className="text-gray-700">Ingreso bruto total: <strong>${ingresoBrutoTotal.toFixed(2)}</strong></p>
              <p className="text-gray-700">Ticket promedio: <strong>${ticketPromedio.toFixed(2)}</strong></p>
            </div>
          )}
        </div>

        {/* NUEVA SECCIÓN: Gráficos - Plegable */}
        <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-lg shadow">
          <div 
            className="flex justify-between items-center p-6 cursor-pointer hover:bg-indigo-100 transition-colors"
            onClick={() => toggleSeccion('graficos')}
          >
            <h3 className="text-2xl font-semibold text-indigo-700">📈 Gráficos y Visualizaciones</h3>
            <span className="text-indigo-700 font-bold text-xl">
              {seccionesAbiertas.graficos ? '−' : '+'}
            </span>
          </div>
          {seccionesAbiertas.graficos && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Gráfico: Ventas por día de la semana */}
                <div className="bg-white p-4 rounded-lg shadow border">
                  <h4 className="text-lg font-semibold mb-3 text-center">Ventas Promedio por Día</h4>
                  <div className="h-64">
                    <Bar data={getGraficoDiasSemana()} options={opcionesBasicas} />
                  </div>
                </div>

                {/* Gráfico: Productos más vendidos */}
                <div className="bg-white p-4 rounded-lg shadow border">
                  <h4 className="text-lg font-semibold mb-3 text-center">Top 10 Productos Más Vendidos</h4>
                  <div className="h-64">
                    <Doughnut data={getGraficoProductos()} options={opcionesBasicas} />
                  </div>
                </div>

                {/* Gráfico: Evolución de ventas (neto y cantidad) - ocupa 2 columnas */}
                <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow border">
                  <h4 className="text-lg font-semibold mb-3 text-center">Evolución de Ventas (Neto y Cantidad)</h4>
                  <div className="mb-3 flex flex-col md:flex-row items-center justify-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Inicio:</label>
                      <input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => {
                          const val = e.target.value;
                          // Si la nueva fecha inicio es posterior a la fecha fin, ajustamos fin
                          if (fechaFin && val > fechaFin) {
                            setFechaFin(val);
                          }
                          setFechaInicio(val);
                        }}
                        className="px-2 py-1 border rounded"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Fin:</label>
                      <input
                        type="date"
                        value={fechaFin}
                        onChange={(e) => {
                          const val = e.target.value;
                          // Si la nueva fecha fin es anterior a la fecha inicio, ajustamos inicio
                          if (fechaInicio && val < fechaInicio) {
                            setFechaInicio(val);
                          }
                          setFechaFin(val);
                        }}
                        className="px-2 py-1 border rounded"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={excluirFinesDeSemana}
                          onChange={(e) => setExcluirFinesDeSemana(e.target.checked)}
                          className="w-4 h-4"
                        />
                        Excluir sábados y domingos
                      </label>
                      <div className="text-sm text-gray-500">(Fin por defecto: hoy, Inicio por defecto: primer día disponible)</div>
                    </div>
                  </div>
                  <div className="h-80">
                    <Line data={getGraficoEvolucionVentas()} options={opcionesEvolucionVentas} />
                  </div>
                </div>

                {/* Gráfico: Evolución ACUMULADA de ventas (neto y cantidad) - ocupa 2 columnas */}
                <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow border">
                  <h4 className="text-lg font-semibold mb-3 text-center">Evolución Acumulada de Ventas (Neto y Cantidad)</h4>
                  <div className="text-sm text-gray-500 text-center mb-2">
                    (Este gráfico usa los mismos filtros de fecha y fines de semana del gráfico anterior)
                  </div>
                  <div className="h-80">
                    <Line data={getGraficoEvolucionAcumulada()} options={opcionesEvolucionAcumulada} />
                  </div>
                </div>

                {/* Gráfico: Rentabilidad por producto */}
                <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow border">
                  <h4 className="text-lg font-semibold mb-3 text-center">Análisis de Rentabilidad - Top 10 Productos</h4>
                  <div className="h-80">
                    <Bar data={getGraficoRentabilidad()} options={{
                      ...opcionesBasicas,
                      plugins: {
                        ...opcionesBasicas.plugins,
                        title: {
                          display: true,
                          text: 'Comparación: Ingresos vs Costos vs Ganancia'
                        }
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: 'Productos'
                          }
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'Monto ($)'
                          }
                        }
                      }
                    }} />
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Promedio por día de la semana - Plegable */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow">
          <div 
            className="flex justify-between items-center p-6 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => toggleSeccion('diasSemana')}
          >
            <h3 className="text-2xl font-semibold text-blue-700">📅 Promedio por día de la semana</h3>
            <span className="text-blue-700 font-bold text-xl">
              {seccionesAbiertas.diasSemana ? '−' : '+'}
            </span>
          </div>
          {seccionesAbiertas.diasSemana && (
            <div className="px-6 pb-6">
              <ul className="text-gray-700 list-disc list-inside">
                {Object.entries(ingresosPorDiaSemana).map(([dia, promedio]) => (
                  <li key={dia}><strong>{dia}:</strong> ${promedio.toFixed(2)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Productos más vendidos - Plegable */}
        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow">
          <div 
            className="flex justify-between items-center p-6 cursor-pointer hover:bg-green-100 transition-colors"
            onClick={() => toggleSeccion('productos')}
          >
            <h3 className="text-2xl font-semibold text-green-700">🥇 Productos más vendidos</h3>
            <span className="text-green-700 font-bold text-xl">
              {seccionesAbiertas.productos ? '−' : '+'}
            </span>
          </div>
          {seccionesAbiertas.productos && (
            <div className="px-6 pb-6">
              <ul className="text-gray-700 list-decimal list-inside">
                {productosVendidos.map((producto, index) => (
                  <li key={index}>{producto.nombre}: {producto.cantidad} unidades</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Análisis por franjas horarias - Plegable */}
        <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg shadow">
          <div 
            className="flex justify-between items-center p-6 cursor-pointer hover:bg-purple-100 transition-colors"
            onClick={() => toggleSeccion('franjas')}
          >
            <h3 className="text-2xl font-semibold text-purple-700">⏰ Análisis por Franjas Horarias</h3>
            <span className="text-purple-700 font-bold text-xl">
              {seccionesAbiertas.franjas ? '−' : '+'}
            </span>
          </div>
          {seccionesAbiertas.franjas && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {horasOrdenadas.map(([hora, datos]) => (
                  <div 
                    key={hora} 
                    className={`p-3 border-l-4 rounded ${getColorFranja(datos.pedidos, maxPedidosHora)}`}
                  >
                    <p className="font-semibold">{getRangoHora(parseInt(hora))}</p>
                    <p className="text-sm">Pedidos: {datos.pedidos}</p>
                    <p className="text-sm">Ventas: ${datos.total.toFixed(2)}</p>
                    <p className="text-xs">Promedio: ${datos.pedidos > 0 ? (datos.total / datos.pedidos).toFixed(2) : '0.00'}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p><span className="inline-block w-3 h-3 bg-red-100 border border-red-500 mr-2"></span>Hora pico (80-100%)</p>
                <p><span className="inline-block w-3 h-3 bg-orange-100 border border-orange-500 mr-2"></span>Hora alta (60-79%)</p>
                <p><span className="inline-block w-3 h-3 bg-yellow-100 border border-yellow-500 mr-2"></span>Hora media (40-59%)</p>
                <p><span className="inline-block w-3 h-3 bg-green-100 border border-green-500 mr-2"></span>Hora baja (0-39%)</p>
              </div>
            </div>
          )}
        </div>

        {/* Análisis de rentabilidad por producto - Plegable */}
        <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-lg shadow">
          <div 
            className="flex justify-between items-center p-6 cursor-pointer hover:bg-emerald-100 transition-colors"
            onClick={() => toggleSeccion('rentabilidad')}
          >
            <h3 className="text-2xl font-semibold text-emerald-700">💰 Análisis de Rentabilidad por Producto</h3>
            <span className="text-emerald-700 font-bold text-xl">
              {seccionesAbiertas.rentabilidad ? '−' : '+'}
            </span>
          </div>
          {seccionesAbiertas.rentabilidad && (
            <div className="px-6 pb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-emerald-700">Margen de Costo Global:</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={margenCostoGlobal}
                        onChange={handleMargenGlobalChange}
                        className="w-16 px-2 py-1 border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-sm"
                      />
                      <span className="absolute right-[-15px] top-1 text-xs text-emerald-600">%</span>
                    </div>
                  </div>
                  <button
                    onClick={aplicarMargenGlobalATodos}
                    className="px-3 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700 transition-colors"
                    title="Aplicar margen global a todos los productos"
                  >
                    Aplicar a todos
                  </button>
                </div>
              </div>

              {/* Indicadores mejorados */}
              <div className="mb-4 p-3 bg-white rounded border">
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Margen de Ganancia Global</p>
                    <p className="text-lg font-bold text-emerald-600">{(100 - margenCostoGlobal).toFixed(1)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Productos Personalizados</p>
                    <p className="text-lg font-bold text-blue-600">{Object.keys(margenesIndividuales).length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Ejemplo: Producto $100</p>
                    <p className="text-sm">Costo: ${margenCostoGlobal.toFixed(1)} | Ganancia: ${(100 - margenCostoGlobal).toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Categoría</p>
                    <p className="text-lg font-bold">
                      {margenCostoGlobal <= 20 ? '🟢 Excelente' : 
                       margenCostoGlobal <= 35 ? '🟡 Bueno' : 
                       margenCostoGlobal <= 50 ? '🟠 Regular' : '🔴 Alto'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Producto</th>
                      <th className="text-right p-2">Margen %</th>
                      <th className="text-right p-2">Cant.</th>
                      <th className="text-right p-2">Ingresos</th>
                      <th className="text-right p-2">Costo Total</th>
                      <th className="text-right p-2">Ganancia</th>
                      <th className="text-right p-2">Margen Ganancia</th>
                      <th className="text-right p-2">Gan/Unidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentabilidadProductos.slice(0, 15).map((producto, index) => (
                      <tr key={index} className={`border-b ${index < 3 ? 'bg-yellow-50' : ''}`}>
                        <td className="p-2 font-medium">
                          <div className="flex items-center gap-2">
                            {producto.nombre}
                            {index < 3 && <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded">TOP {index + 1}</span>}
                            {producto.tieneMargenPersonalizado && <span className="text-xs bg-blue-500 text-white px-1 py-0.5 rounded">Custom</span>}
                          </div>
                        </td>
                        <td className="text-right p-2">
                          <div className="flex items-center justify-end gap-1">
                            {editandoProducto === producto.nombre ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.5"
                                  defaultValue={producto.margenCostoUsado}
                                  onBlur={(e) => handleMargenIndividualChange(producto.nombre, e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleMargenIndividualChange(producto.nombre, e.target.value);
                                    }
                                  }}
                                  className="w-12 px-1 py-0.5 border border-gray-300 rounded text-xs text-center"
                                  autoFocus
                                />
                                <span className="text-xs">%</span>
                              </div>
                            ) : (
                              <div
                                className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded flex items-center gap-1"
                                onClick={() => setEditandoProducto(producto.nombre)}
                                title="Click para editar margen individual"
                              >
                                <span className={producto.tieneMargenPersonalizado ? 'text-blue-600 font-semibold' : ''}>
                                  {producto.margenCostoUsado.toFixed(1)}%
                                </span>
                                <span className="text-xs text-gray-400">✏️</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="text-right p-2">{producto.cantidad}</td>
                        <td className="text-right p-2">${producto.ingresoTotal.toFixed(2)}</td>
                        <td className="text-right p-2 text-red-600">${producto.costoTotal.toFixed(2)}</td>
                        <td className="text-right p-2 font-semibold text-green-600">
                          ${producto.gananciaBruta.toFixed(2)}
                        </td>
                        <td className="text-right p-2">
                          <span className={`px-2 py-1 rounded text-xs ${getColorMargen(producto.margenPorcentaje)}`}>
                            {producto.margenPorcentaje.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-right p-2">${producto.gananciaUnitaria.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-3 rounded border">
                  <p className="font-semibold text-emerald-600">Ganancia Total</p>
                  <p className="text-lg">${rentabilidadProductos.reduce((sum, p) => sum + p.gananciaBruta, 0).toFixed(2)}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-semibold text-red-600">Costo Total</p>
                  <p className="text-lg">${rentabilidadProductos.reduce((sum, p) => sum + p.costoTotal, 0).toFixed(2)}</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-semibold text-blue-600">Margen Ganancia Promedio</p>
                  <p className="text-lg">{rentabilidadProductos.length > 0 ? (rentabilidadProductos.reduce((sum, p) => sum + p.margenPorcentaje, 0) / rentabilidadProductos.length).toFixed(1) : 0}%</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-semibold text-purple-600">Mejor Margen Ganancia</p>
                  <p className="text-lg">{rentabilidadProductos.length > 0 ? Math.max(...rentabilidadProductos.map(p => p.margenPorcentaje)).toFixed(1) : 0}%</p>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                <p>💡 <strong>Margen de Costo:</strong> % del precio que representa el costo. <strong>Margen de Ganancia:</strong> % del precio que es ganancia.</p>
                <p>🔧 Haz click en el % de margen de cada producto para personalizarlo individualmente.</p>
              </div>
            </div>
          )}
        </div>

        {/* Ingresos por Día - Plegable */}
        <div className="bg-white border border-gray-200 rounded-lg shadow">
          <div 
            className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSeccion('ingresosPorDia')}
          >
            <h3 className="text-2xl font-semibold text-gray-800">📈 Ingresos por Día</h3>
            <span className="text-gray-800 font-bold text-xl">
              {seccionesAbiertas.ingresosPorDia ? '−' : '+'}
            </span>
          </div>
          {seccionesAbiertas.ingresosPorDia && (
            <div className="px-6 pb-6">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;