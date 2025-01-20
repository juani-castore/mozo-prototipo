import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import CartProvider from "./CartContext"; // Importa el proveedor del carrito
import './styles.css';

ReactDOM.render(
  <React.StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
