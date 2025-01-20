import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../CartContext";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.precio * item.quantity, 0);
  };

  const handleIncrease = (productId) => {
    const product = cart.find((item) => item.id === productId);
    updateQuantity(productId, product.quantity + 1);
  };

  const handleDecrease = (productId) => {
    const product = cart.find((item) => item.id === productId);
    if (product.quantity > 1) {
      updateQuantity(productId, product.quantity - 1);
    } else {
      removeFromCart(productId);
    }
  };

  const handleSendOrder = () => {
    const phoneNumber = "5492645271386"; // Reemplaza con el número del restaurante
    const orderDetails = cart
      .map(
        (item) =>
          `- ${item.nombre} x ${item.quantity} ($${item.precio * item.quantity})`
      )
      .join("\n");
    const total = calculateTotal();
    const message = `Hola, quiero realizar el siguiente pedido:\n\n${orderDetails}\n\nTotal: $${total}\n\nGracias.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="container">
      <h2>Carrito</h2>
      {cart.length > 0 ? (
        cart.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              border: "1px solid var(--brick)",
              padding: "1rem",
              borderRadius: "8px",
            }}
          >
            <span>
              {item.nombre} x {item.quantity}
            </span>
            <div>
              <button onClick={() => handleDecrease(item.id)}>-</button>
              <button onClick={() => handleIncrease(item.id)}>+</button>
            </div>
          </div>
        ))
      ) : (
        <p>Tu carrito está vacío.</p>
      )}
      {cart.length > 0 && (
        <>
          <h3>Total: ${calculateTotal()}</h3>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
            <Link to="/checkout">
              <button>Ir a pagar</button>
            </Link>
            <button
              onClick={clearCart}
              style={{
                backgroundColor: "var(--brick)",
                color: "var(--white)",
                border: "none",
                padding: "0.7rem 1.5rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "background-color 0.3s ease",
              }}
            >
              Limpiar carrito
            </button>
            <button
              onClick={handleSendOrder}
              style={{
                backgroundColor: "var(--gold)",
                color: "var(--white)",
                border: "none",
                padding: "0.7rem 1.5rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "background-color 0.3s ease",
              }}
            >
              Enviar pedido
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
