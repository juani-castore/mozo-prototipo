// RestauranteDashboard.jsx
import { useNavigate } from "react-router-dom";

const RestauranteDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-brick mb-2 tracking-tight">MOZO</h1>
        <h2 className="text-3xl md:text-4xl font-black text-brick mb-4 tracking-tight">Panel de Administración</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-gold/10 via-gold to-gold/10 mx-auto" />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
        <button
          className="w-full bg-brick text-white px-6 py-4 rounded-xl shadow-xl hover:shadow-2xl hover:bg-brick-light font-black tracking-tight border-2 border-brick transition-all duration-200 motion-safe:hover:-translate-y-0.5"
          onClick={() => navigate("/restaurante/pedidos")}
        >
          📋 Pedidos
        </button>
        <button
          className="w-full bg-gold text-brick px-6 py-4 rounded-xl shadow-xl hover:shadow-2xl hover:bg-white font-black tracking-tight border-2 border-gold transition-all duration-200 motion-safe:hover:-translate-y-0.5"
          onClick={() => navigate("/restaurante/menu")}
        >
          🍽️ Menú
        </button>
        <button
          className="w-full bg-brick text-white px-6 py-4 rounded-xl shadow-xl hover:shadow-2xl hover:bg-brick-light font-black tracking-tight border-2 border-brick transition-all duration-200 motion-safe:hover:-translate-y-0.5"
          onClick={() => navigate("/restaurante/estadisticas")}
        >
          📊 Estadísticas
        </button>
      </div>
    </div>
  );
};

export default RestauranteDashboard;
