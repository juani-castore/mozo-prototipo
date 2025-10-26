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

function App() {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  return (
    <Router basename="/fud">
      <Navbar />
      <Routes>
        <Route path="/" element={<Menu cart={cart} setCart={setCart} />} />
        <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
        <Route path="/checkout" element={<Checkout cart={cart} />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />
        <Route path="/payment-pending" element={<PaymentPending />} />
        <Route path="/restaurante" element={<RestauranteLogin />} />
        <Route path="/restaurante/dashboard" element={<RestauranteDashboard />} />
        <Route path="/restaurante/pedidos" element={<Pedidos />} />
        <Route path="/restaurante/menu" element={<MenuDashboard />} />
        <Route path="/restaurante/estadisticas" element={<Estadisticas />} />
      </Routes>
    </Router>
  );
}

export default App;
