import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../CartContext";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      // Si item.price es undefined o no es convertible, se usará 0
      const itemPrice = parseFloat(item.price) || 0;
      return total + itemPrice * item.quantity;
    }, 0);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-4xl font-bold text-center text-brick mb-8">Carrito</h2>
      {cart.length > 0 ? (
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center bg-brick-light text-white p-4 rounded-lg shadow-md"
            >
              <div>
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p>Cantidad: {item.quantity}</p>
                <p className="text-sm">
                  Precio: ${ (parseFloat(item.price) || 0) * item.quantity }
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDecrease(item.id)}
                  className="bg-white text-brick px-3 py-1 rounded-full font-bold shadow-md hover:bg-gray-200"
                >
                  -
                </button>
                <button
                  onClick={() => handleIncrease(item.id)}
                  className="bg-white text-brick px-3 py-1 rounded-full font-bold shadow-md hover:bg-gray-200"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-white bg-red-500 px-3 py-1 rounded-lg font-bold shadow-md hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-brick">
              Total: ${calculateTotal()}
            </h3>
          </div>
          <div className="flex flex-wrap justify-between items-center mt-6 space-x-4">
            <Link to="/checkout" className="flex-1">
              <button className="bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-green-700 w-full">
                Ir a pagar
              </button>
            </Link>
            <button
              onClick={clearCart}
              className="bg-red-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-red-700 w-full flex-1"
            >
              Limpiar carrito
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-lg text-gray-600">Tu carrito está vacío.</p>
      )}
    </div>
  );
};

export default Cart;
