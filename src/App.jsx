// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import OrderConfirmation from "./components/OrderConfirmation";
import RestauranteLogin from "./components/RestauranteLogin";
import Pedidos from "./components/Pedidos";
import RestauranteDashboard from "./components/RestauranteDashboard";
import MenuDashboard from "./components/MenuDashboard"; // Nuevo componente para administrar el menú
import PaymentFailed from "./components/PaymentFailed";
import PaymentPending from "./components/PaymentPending";
import Estadisticas from "./components/Estadisticas"; // Componente para estadísticas
import Welcome from "./components/Welcome"; // Nueva página de bienvenida

function App() {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  return (
    <Router>
      <Routes>
        {/* Ruta principal - Selección de restaurantes (sin Navbar) */}
        <Route path="/" element={<Welcome />} />
        
        {/* Rutas de FUD con Navbar */}
        <Route path="/fud/menu" element={<><Navbar /><Menu cart={cart} setCart={setCart} /></>} />
        <Route path="/fud/cart" element={<><Navbar /><Cart cart={cart} setCart={setCart} /></>} />
        <Route path="/fud/checkout" element={<><Navbar /><Checkout cart={cart} /></>} />
        <Route path="/fud/order-confirmation" element={<><Navbar /><OrderConfirmation /></>} />
        <Route path="/fud/payment-failed" element={<><Navbar /><PaymentFailed /></>} />
        <Route path="/fud/payment-pending" element={<><Navbar /><PaymentPending /></>} />
        <Route path="/fud/restaurante" element={<><Navbar /><RestauranteLogin /></>} />
        <Route path="/fud/restaurante/dashboard" element={<><Navbar /><RestauranteDashboard /></>} />
        <Route path="/fud/restaurante/pedidos" element={<><Navbar /><Pedidos /></>} />
        <Route path="/fud/restaurante/menu" element={<><Navbar /><MenuDashboard /></>} />
        <Route path="/fud/restaurante/estadisticas" element={<><Navbar /><Estadisticas /></>} />
      </Routes>
    </Router>
  );
}

export default App;
