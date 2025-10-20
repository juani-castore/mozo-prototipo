import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../CartContext";

const Checkout = () => {
  const FN_BASE_URL = window.location.host.includes("mozo-prototipo.vercel.app")
    ? "https://us-central1-prototipo-mozo.cloudfunctions.net/generarLinkDePagoOld"
    : "https://us-central1-prototipo-mozo.cloudfunctions.net/generarLinkDePago";
 
  const { cart } = useContext(CartContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    pickupTime: "",
    comments: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [retirarAhora, setRetirarAhora] = useState(true); // Por defecto "Retirar ya"

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleRetirarAhora = () => {
    const newRetirarAhora = !retirarAhora;
    setRetirarAhora(newRetirarAhora);
    
    if (newRetirarAhora) {
      // Si activa "Retirar ya", setear hora actual
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      setFormData((prev) => ({ ...prev, pickupTime: currentTime }));
    } else {
      // Si desactiva "Retirar ya", limpiar la hora para que pueda elegir
      setFormData((prev) => ({ ...prev, pickupTime: "" }));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = parseFloat(item.price) || 0;
      return total + itemPrice * item.quantity;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const carritoMP = cart.map((item) => ({
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
      }));

      const orderData = {
        name: formData.name,
        email: formData.email,
        pickupTime: formData.pickupTime,
        comments: formData.comments,
        cart,
      };

      const response = await fetch(FN_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrito: carritoMP,
          mesa: "Mesa 1",
          orderData,
        }),
      });

      if (!response.ok) throw new Error("Error HTTP: " + response.status);
      const data = await response.json();

      localStorage.setItem("orderData", JSON.stringify(orderData));
      window.location.href = data.init_point;
    } catch (error) {
      console.error("❌ Error al generar link de pago:", error);
      alert("No se pudo procesar el pago.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-5 py-8 pb-28 sm:pb-12 [padding-bottom:env(safe-area-inset-bottom)]">
      
      {/* Header unificado */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-brick mb-2 tracking-tight">MOZO</h1>
        <h2 className="text-3xl md:text-4xl font-black text-brick mb-4 tracking-tight">Checkout</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-gold/10 via-gold to-gold/10 mx-auto mb-4" />
        <p className="text-gray-600 font-semibold max-w-md mx-auto leading-relaxed">
          Completa tus datos para finalizar el pedido
        </p>
      </div>

      <div className="w-full max-w-4xl space-y-6">
        
        {/* Resumen del pedido */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200">
          <div className="bg-gold text-brick px-6 py-4 rounded-t-xl">
            <h3 className="font-black text-lg tracking-tight">Resumen de tu pedido</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b-2 border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gold text-brick rounded-xl flex items-center justify-center text-xs font-black shadow-sm border-2 border-gold">
                      {item.quantity}
                    </div>
                    <span className="font-black text-brick">{item.name}</span>
                  </div>
                  <span className="font-black text-brick">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="h-px bg-gradient-to-r from-gold/10 via-gold to-gold/10 w-full my-4" />
              <div className="flex justify-between items-center text-xl font-black text-brick">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de datos */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200">
          <div className="bg-brick text-white px-6 py-4 rounded-t-xl">
            <h3 className="font-black text-lg tracking-tight">Datos del cliente</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Nombre completo */}
            <div>
              <label className="block text-sm font-black mb-3 text-brick tracking-wide">
                Nombre completo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brick focus:ring-2 focus:ring-brick/20 transition-all duration-200 font-semibold shadow-sm"
                placeholder="Ingresa tu nombre completo"
              />
            </div>

            {/* Correo electrónico */}
            <div>
              <label className="block text-sm font-black mb-3 text-brick tracking-wide">
                Correo electrónico *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brick focus:ring-2 focus:ring-brick/20 transition-all duration-200 font-semibold shadow-sm"
                placeholder="ejemplo@correo.com"
              />
            </div>

            {/* Hora de retiro con interruptor */}
            <div>
              <label className="block text-sm font-black mb-3 text-brick tracking-wide">
                Hora de retiro
              </label>
              
              {/* Interruptor Toggle - Ancho completo y más estético */}
              <div className="mb-4">
                <div className="relative flex items-center bg-gray-100 rounded-2xl p-2 border-2 border-gray-200 shadow-sm w-full">
                  {/* Background del toggle */}
                  <div 
                    className={`absolute top-2 bottom-2 w-1/2 bg-white rounded-xl shadow-lg transition-all duration-300 ease-in-out border-2 border-gold ${
                      retirarAhora ? 'left-2' : 'left-1/2 ml-0'
                    }`}
                  />
                  
                  {/* Opción "Retirar ya" */}
                  <button
                    type="button"
                    onClick={handleToggleRetirarAhora}
                    className={`relative z-10 py-4 text-base font-black rounded-xl transition-all duration-200 flex-1 ${
                      retirarAhora
                        ? 'text-brick'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Retirar ya
                  </button>
                  
                  {/* Opción "Programar" */}
                  <button
                    type="button"
                    onClick={handleToggleRetirarAhora}
                    className={`relative z-10 py-4 text-base font-black rounded-xl transition-all duration-200 flex-1 ${
                      !retirarAhora
                        ? 'text-brick'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Programar
                  </button>
                </div>
              </div>

              {/* Contenido según la opción seleccionada */}
              <div className="mt-4">
                {retirarAhora ? (
                  /* Modo "Retirar ya" */
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-green-600">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-green-800 text-lg tracking-tight">Retiro inmediato configurado</p>
                        <p className="text-green-700 font-semibold">
                          Tu pedido estará listo para retirar en los próximos minutos
                        </p>
                        {formData.pickupTime && (
                          <p className="text-green-600 font-black text-sm mt-2 bg-green-100 px-3 py-1 rounded-full inline-block border-2 border-green-200">
                            Hora registrada: {formData.pickupTime}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Modo "Programar hora" */
                  <div className="space-y-4">
                    <input
                      type="time"
                      name="pickupTime"
                      value={formData.pickupTime}
                      onChange={handleTimeChange}
                      required={!retirarAhora}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-brick focus:ring-2 focus:ring-brick/20 transition-all duration-200 font-black text-lg text-center bg-white shadow-sm"
                    />
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-blue-600">
                          <div className="w-6 h-6 border-2 border-white rounded-sm"></div>
                        </div>
                        <div>
                          <p className="text-blue-800 font-black text-lg tracking-tight">
                            Selecciona tu hora preferida
                          </p>
                          <p className="text-blue-700 font-semibold">
                            Elige cuándo quieres retirar tu pedido
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comentarios */}
            <div>
              <label className="block text-sm font-black mb-3 text-brick tracking-wide">
                Comentarios adicionales
              </label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows="4"
                placeholder="¿Hay algo más que deberíamos saber sobre tu pedido? (Opcional)"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brick focus:ring-2 focus:ring-brick/20 transition-all duration-200 font-semibold resize-none shadow-sm"
              />
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-xl font-black text-lg tracking-tight transition-all duration-200 shadow-xl ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-brick text-white hover:bg-brick-light hover:shadow-2xl motion-safe:hover:-translate-y-0.5 border-2 border-brick'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>💳</span>
                  <span>Confirmar y Pagar</span>
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-center">
          <Link to="/cart" className="inline-flex items-center text-brick hover:text-brick-light font-black transition-colors duration-200 tracking-wide">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0L3.586 12l2.707-2.707a1 1 0 011.414 1.414L6.414 12l1.293 1.293a1 1 0 010 1.414z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            ← Volver al carrito
          </Link>
        </div>
      </div>

      {/* Botones fijos - Copiados exactamente de Cart */}
      <button
        className="fixed bottom-4 left-4 z-40 bg-white/60 backdrop-blur
             border-2 border-green-600 text-green-700 font-semibold rounded-full 
             hover:bg-green-50 hover:border-green-700 shadow-sm transition-all
             px-6 py-3 text-base min-[480px]:px-5 min-[480px]:py-2.5 min-[480px]:text-sm 
             min-[400px]:px-4 min-[400px]:py-2 min-[400px]:text-sm
             min-[360px]:px-3 min-[360px]:py-2 min-[360px]:text-xs"
        onClick={() => 
          window.open('https://wa.me/5492645271386?text=Hola%2C%20quiero%20hablar%20con%20MOZO', '_blank')
        }
      >
        <span className="min-[480px]:hidden">MOZO</span>
        <span className="hidden min-[480px]:inline">Hablar con MOZO</span>
      </button>

      <button
        onClick={() => window.location.href = '/'}
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

export default Checkout;
