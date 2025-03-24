import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import OrderConfirmation from "./components/OrderConfirmation";
import RestauranteLogin from "./components/RestauranteLogin";
import Pedidos from "./components/Pedidos";
import CocinaDashboard from "./components/CocinaDashboard";
import RestauranteDashboard from "./components/RestauranteDashboard";
import PaymentFailed from "./components/PaymentFailed";        // ⬅️ NUEVO
import PaymentPending from "./components/PaymentPending";      // ⬅️ NUEVO

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
        <Route path="/restaurante/cocina" element={<CocinaDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
