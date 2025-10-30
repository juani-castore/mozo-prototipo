import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../CartContext";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-pickap-gray px-3 sm:px-5 py-6 sm:py-8 pb-32 sm:pb-28 [padding-bottom:env(safe-area-inset-bottom)]">
      {/* Header del carrito */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-center text-pickap-black mb-2 tracking-tight">TU CARRITO</h1>
        <p className="text-pickap-gray-dark font-medium text-sm sm:text-base">
          {cart.length === 0 ? "Tu carrito está esperando" : `${cart.length} ${cart.length === 1 ? 'producto' : 'productos'} seleccionado${cart.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {cart.length > 0 ? (
        <div className="w-full max-w-4xl space-y-4 sm:space-y-6">
          {/* Lista de productos */}
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="bg-pickap-black text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl">
              <h3 className="font-bold text-base sm:text-lg">Productos en tu pedido</h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              {cart.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-6 hover:bg-pickap-gray transition-all duration-200"
                >
                  {/* Layout móvil: Stack vertical */}
                  <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                    
                    {/* Información del producto */}
                    <div className="flex-1">
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        {/* Número de item */}
                        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-pickap-yellow text-pickap-black rounded-xl flex items-center justify-center">
                          <span className="text-xs sm:text-sm font-bold">{index + 1}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg sm:text-xl font-bold text-pickap-black mb-2 leading-tight pr-2">
                            {item.name}
                          </h4>
                          
                          {/* Precios en móvil: Stack vertical */}
                          <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
                            <span className="inline-block bg-pickap-gray text-pickap-black px-2 py-1 rounded-full font-medium text-xs sm:text-sm">
                              ${parseFloat(item.price).toFixed(2)} c/u
                            </span>
                            <span className="inline-block bg-pickap-yellow text-pickap-black px-2 py-1 rounded-full font-bold text-xs sm:text-sm">
                              Subtotal: ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                          
                          {item.quantity >= item.stock && (
                            <div className="mt-2 inline-flex items-center bg-pickap-red/10 text-pickap-red px-2 py-1 rounded-full text-xs font-bold">
                              <span className="mr-1">⚠️</span>
                              <span className="text-xs">Máximo stock disponible</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Controles en móvil: Centrados y más grandes */}
                    <div className="flex items-center justify-center space-x-3 sm:space-x-3 sm:ml-4 pt-2 sm:pt-0">
                      
                      {/* Control de cantidad - Más grande en móvil */}
                      <div className="flex items-center bg-pickap-gray rounded-xl">
                        <button
                          onClick={() => handleDecrease(item.id)}
                          className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center text-pickap-black hover:text-white hover:bg-pickap-black rounded-xl transition-all duration-200 font-bold text-xl sm:text-lg"
                        >
                          −
                        </button>
                        <div className="w-14 sm:w-16 text-center">
                          <span className="text-lg sm:text-lg font-bold text-pickap-black">{item.quantity}</span>
                        </div>
                        <button
                          onClick={() => handleIncrease(item.id)}
                          className={`w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all duration-200 font-bold text-xl sm:text-lg ${
                            item.quantity >= item.stock
                              ? "text-pickap-gray-dark cursor-not-allowed"
                              : "text-pickap-black hover:text-white hover:bg-pickap-black"
                          }`}
                          disabled={item.quantity >= item.stock}
                        >
                          +
                        </button>
                      </div>

                      {/* Botón eliminar - Más grande en móvil */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center text-pickap-gray-dark hover:text-pickap-red hover:bg-pickap-red/10 rounded-xl transition-all duration-200 group"
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

          {/* Resumen del total */}
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="bg-pickap-yellow text-pickap-black px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl">
              <h3 className="font-bold text-base sm:text-lg">Resumen del pedido</h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-pickap-gray-dark font-medium text-sm sm:text-base">
                  <span>Productos ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="font-bold text-pickap-black">${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-pickap-gray-dark font-medium text-sm sm:text-base">
                  <span>Descuentos</span>
                  <span className="text-pickap-green font-bold">$0.00</span>
                </div>
                <div className="h-px bg-pickap-gray-dark/20 w-full my-4" />
                <div className="flex justify-between items-center text-xl sm:text-2xl font-bold text-pickap-black">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción - Stack en móvil */}
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <Link to="/fud/checkout" className="block">
              <button className="w-full bg-pickap-yellow text-pickap-black hover:bg-pickap-yellow/90 font-bold py-4 px-6 rounded-xl shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-0.5 text-sm sm:text-base">
                Proceder al pago
              </button>
            </Link>
            
            <button
              onClick={clearCart}
              className="w-full bg-white text-pickap-black border border-pickap-gray-dark hover:bg-pickap-gray font-bold py-4 px-6 rounded-xl shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-0.5 text-sm sm:text-base"
            >
              Vaciar carrito
            </button>
          </div>

          {/* Mensaje de continuidad */}
          <div className="text-center pt-2">
            <Link to="/fud/menu" className="inline-flex items-center text-pickap-black hover:text-pickap-gray-dark font-medium transition-colors duration-200 text-sm sm:text-base">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0L3.586 12l2.707-2.707a1 1 0 011.414 1.414L6.414 12l1.293 1.293a1 1 0 010 1.414z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              ← Continuar comprando
            </Link>
          </div>
        </div>
      ) : (
        /* Estado vacío */
        <div className="text-center py-12 sm:py-16 w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-pickap-yellow/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl sm:text-4xl">🛒</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-pickap-black mb-4">Tu carrito está vacío</h3>
            <p className="text-pickap-gray-dark mb-6 sm:mb-8 font-medium text-sm sm:text-base">¡Descubre nuestros deliciosos productos y añade algunos a tu carrito!</p>
            
            <Link to="/fud/menu">
              <button className="bg-pickap-yellow text-pickap-black hover:bg-pickap-yellow/90 font-bold py-3 px-6 sm:px-8 rounded-xl shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-0.5 text-sm sm:text-base">
                Ver productos
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Botones fijos */}
      <button
        className="fixed bottom-4 left-4 z-40 bg-white
             border border-pickap-green text-pickap-green font-semibold rounded-full 
             hover:bg-pickap-green hover:text-white shadow-sm transition-all
             px-6 py-3 text-base min-[480px]:px-5 min-[480px]:py-2.5 min-[480px]:text-sm 
             min-[400px]:px-4 min-[400px]:py-2 min-[400px]:text-sm
             min-[360px]:px-3 min-[360px]:py-2 min-[360px]:text-xs"
        onClick={() => 
          window.open('https://wa.me/5492645271386?text=Hola%2C%20quiero%20hablar%20con%20PICKUP', '_blank')
        }
      >
        <span className="min-[480px]:hidden">PICKUP</span>
        <span className="hidden min-[480px]:inline">Hablar con PICKUP</span>
      </button>

      <button
        onClick={() => navigate('/fud/menu')}
        className="fixed bottom-4 right-4 z-50 bg-gold text-brick font-extrabold rounded-xl 
             shadow-xl ring-2 ring-yellow-300/40 hover:shadow-2xl motion-safe:hover:-translate-y-0.5 
             transition-all tracking-tight
             px-6 py-3 text-base min-[480px]:px-5 min-[480px]:py-2.5 min-[480px]:text-sm 
             min-[400px]:px-4 min-[400px]:py-2 min-[400px]:text-sm
             min-[360px]:px-3 min-[360px]:py-2 min-[360px]:text-xs"
      >
        <span className="min-[520px]:hidden">Menú</span>
        <span className="hidden min-[520px]:inline">Volver al Menú</span>
      </button>
    </div>
  );
};

export default Cart;
