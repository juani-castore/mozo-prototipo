import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../CartContext";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = parseFloat(item.price) || 0;
      return total + itemPrice * item.quantity;
    }, 0);
  };

  const handleIncrease = (productId) => {
    const product = cart.find((item) => item.id === productId);
    if (product.quantity < product.stock) {
      updateQuantity(productId, product.quantity + 1);
    }
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-5 py-8 pb-28 sm:pb-12 [padding-bottom:env(safe-area-inset-bottom)]">
      {/* Header del carrito - Estilo Mozo */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-brick mb-2">MOZO</h1>
        <h2 className="text-3xl md:text-4xl font-bold text-center text-brick mb-4">Carrito</h2>
        <p className="text-gray-600 font-medium tracking-wide">
          {cart.length === 0 ? "Tu carrito está esperando" : `${cart.length} ${cart.length === 1 ? 'producto' : 'productos'} seleccionado${cart.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {cart.length > 0 ? (
        <div className="w-full max-w-4xl space-y-6">
          {/* Lista de productos - Estilo unificado */}
          <div className="bg-white rounded-xl shadow-md border">
            <div className="bg-brick text-white px-6 py-4 rounded-t-xl">
              <h3 className="font-extrabold text-lg tracking-tight">Productos en tu pedido</h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              {cart.map((item, index) => (
                <div
                  key={item.id}
                  className="p-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    {/* Información del producto */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        {/* Número de item - Estilo gold */}
                        <div className="flex-shrink-0 w-8 h-8 bg-gold text-brick rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="text-xl font-extrabold text-brick mb-1 tracking-tight">{item.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="bg-gray-100 text-brick px-3 py-1 rounded-full font-semibold border">
                              ${parseFloat(item.price).toFixed(2)} c/u
                            </span>
                            <span className="bg-gold/20 text-brick px-3 py-1 rounded-full font-bold border border-gold/30">
                              Subtotal: ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                          {item.quantity >= item.stock && (
                            <div className="mt-2 inline-flex items-center bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                              <span className="mr-1">⚠️</span>
                              Máximo stock disponible
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Controles de cantidad y eliminar */}
                    <div className="flex items-center space-x-3 ml-4">
                      {/* Control de cantidad - Estilo brick */}
                      <div className="flex items-center bg-gray-100 rounded-xl border border-gray-200">
                        <button
                          onClick={() => handleDecrease(item.id)}
                          className="w-10 h-10 flex items-center justify-center text-brick hover:text-white hover:bg-brick rounded-xl transition-all duration-200 font-bold text-lg"
                        >
                          −
                        </button>
                        <div className="w-16 text-center">
                          <span className="text-lg font-black text-brick">{item.quantity}</span>
                        </div>
                        <button
                          onClick={() => handleIncrease(item.id)}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 font-bold text-lg ${
                            item.quantity >= item.stock
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-brick hover:text-white hover:bg-brick"
                          }`}
                          disabled={item.quantity >= item.stock}
                        >
                          +
                        </button>
                      </div>

                      {/* Botón eliminar */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group border border-gray-200 hover:border-red-200"
                        title="Eliminar producto"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen del total - Estilo gold */}
          <div className="bg-white rounded-xl shadow-md border">
            <div className="bg-gold text-brick px-6 py-4 rounded-t-xl">
              <h3 className="font-extrabold text-lg tracking-tight">Resumen del pedido</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-gray-600 font-medium">
                  <span>Productos ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="font-black text-brick">${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600 font-medium">
                  <span>Descuentos</span>
                  <span className="text-green-600 font-bold">$0.00</span>
                </div>
                <div className="h-px bg-brick/10 w-full my-4" />
                <div className="flex justify-between items-center text-2xl font-black text-brick">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción - Estilo Mozo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/checkout" className="order-2 md:order-1">
              <button className="w-full bg-brick text-white hover:bg-brick-light font-extrabold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 motion-safe:hover:-translate-y-0.5 tracking-tight">
                Proceder al pago
              </button>
            </Link>
            
            <button
              onClick={clearCart}
              className="order-1 md:order-2 w-full bg-white text-brick border-2 border-brick hover:bg-brick hover:text-white font-extrabold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 motion-safe:hover:-translate-y-0.5 tracking-tight"
            >
              Vaciar carrito
            </button>
          </div>

          {/* Mensaje de continuidad */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center text-brick hover:text-brick-light font-bold transition-colors duration-200 tracking-wide">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0L3.586 12l2.707-2.707a1 1 0 011.414 1.414L6.414 12l1.293 1.293a1 1 0 010 1.414z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              ← Continuar comprando
            </Link>
          </div>
        </div>
      ) : (
        /* Estado vacío - Estilo Mozo */
        <div className="text-center py-16 w-full max-w-md">
          <div className="bg-white rounded-xl shadow-md p-12 border">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border">
              <span className="text-4xl">🛒</span>
            </div>
            <h3 className="text-2xl font-extrabold text-brick mb-4 tracking-tight">Tu carrito está vacío</h3>
            <p className="text-gray-600 mb-8 font-medium">¡Descubre nuestros deliciosos productos y añade algunos a tu carrito!</p>
            
            <Link to="/">
              <button className="bg-brick text-white hover:bg-brick-light font-extrabold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 motion-safe:hover:-translate-y-0.5 tracking-tight">
                Ver productos
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Botón fijo de WhatsApp - Estilo consistente */}
      <button
        className="fixed bottom-20 left-4 md:bottom-4 md:left-4 z-40 bg-white/60 backdrop-blur
             border-2 border-green-600 text-green-700 font-semibold px-3 py-2 text-sm
             md:px-4 md:py-2 md:text-base rounded-full hover:bg-green-50 hover:border-green-700
             shadow-sm transition-all"
        onClick={() => 
          window.open('https://wa.me/5491150227179?text=Hola%2C%20quiero%20hablar%20con%20MOZO', '_blank')
        }
      >
        Hablar con MOZO
      </button>

      {/* Botón fijo para volver al menú - Nuevo */}
      <Link to="/">
        <button
          className="fixed bottom-4 right-4 z-50 bg-gold text-brick font-extrabold px-6 py-3 text-base
               md:px-7 md:py-3.5 md:text-lg rounded-xl shadow-xl ring-2 ring-yellow-300/40
               hover:shadow-2xl hover:translate-y-0.5 transition-all tracking-tight"
        >
          Volver al Menú
        </button>
      </Link>
    </div>
  );
};

export default Cart;
