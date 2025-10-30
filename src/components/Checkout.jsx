import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../CartContext";

const Checkout = () => {
  // URLs actualizadas después del deploy de Cloud Functions Gen 2
  const FN_BASE_URL = window.location.host.includes("mozo-prototipo.vercel.app")
    ? "https://us-central1-prototipo-mozo.cloudfunctions.net/generarLinkDePagoOld"
    : "https://us-central1-prototipo-mozo.cloudfunctions.net/generarLinkDePago";
 
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-pickap-gray px-5 py-8 pb-28 sm:pb-12 [padding-bottom:env(safe-area-inset-bottom)]">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-pickap-black mb-2 tracking-tight">CHECKOUT</h1>
        <p className="text-pickap-gray-dark font-medium max-w-md mx-auto">
          Completa tus datos para finalizar el pedido
        </p>
      </div>

      <div className="w-full max-w-4xl space-y-6">
        
        {/* Resumen del pedido */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="bg-pickap-yellow text-pickap-black px-6 py-4 rounded-t-2xl">
            <h3 className="font-bold text-lg">Resumen de tu pedido</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-pickap-gray last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-pickap-yellow text-pickap-black rounded-xl flex items-center justify-center text-xs font-bold">
                      {item.quantity}
                    </div>
                    <span className="font-bold text-pickap-black">{item.name}</span>
                  </div>
                  <span className="font-bold text-pickap-black">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="h-px bg-pickap-gray-dark/20 w-full my-4" />
              <div className="flex justify-between items-center text-xl font-bold text-pickap-black">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de datos */}
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="bg-pickap-black text-white px-6 py-4 rounded-t-2xl">
            <h3 className="font-bold text-lg">Datos del cliente</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Nombre completo */}
            <div>
              <label className="block text-sm font-bold mb-3 text-pickap-black">
                Nombre completo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-pickap-gray-dark/30 rounded-xl focus:outline-none focus:border-pickap-yellow focus:ring-2 focus:ring-pickap-yellow/20 transition-all duration-200 font-medium"
                placeholder="Ingresa tu nombre completo"
              />
            </div>

            {/* Correo electrónico */}
            <div>
              <label className="block text-sm font-bold mb-3 text-pickap-black">
                Correo electrónico *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-pickap-gray-dark/30 rounded-xl focus:outline-none focus:border-pickap-yellow focus:ring-2 focus:ring-pickap-yellow/20 transition-all duration-200 font-medium"
                placeholder="ejemplo@correo.com"
              />
            </div>

            {/* Hora de retiro con interruptor */}
            <div>
              <label className="block text-sm font-bold mb-3 text-pickap-black">
                Hora de retiro
              </label>
              
              {/* Interruptor Toggle */}
              <div className="mb-4">
                <div className="relative flex items-center bg-pickap-gray rounded-2xl p-2 w-full">
                  {/* Background del toggle */}
                  <div 
                    className={`absolute top-2 bottom-2 w-1/2 bg-white rounded-xl shadow-sm transition-all duration-300 ease-in-out ${
                      retirarAhora ? 'left-2' : 'left-1/2 ml-0'
                    }`}
                  />
                  
                  {/* Opción "Retirar ya" */}
                  <button
                    type="button"
                    onClick={handleToggleRetirarAhora}
                    className={`relative z-10 py-4 text-base font-bold rounded-xl transition-all duration-200 flex-1 ${
                      retirarAhora
                        ? 'text-pickap-black'
                        : 'text-pickap-gray-dark hover:text-pickap-black'
                    }`}
                  >
                    Retirar ya
                  </button>
                  
                  {/* Opción "Programar" */}
                  <button
                    type="button"
                    onClick={handleToggleRetirarAhora}
                    className={`relative z-10 py-4 text-base font-bold rounded-xl transition-all duration-200 flex-1 ${
                      !retirarAhora
                        ? 'text-pickap-black'
                        : 'text-pickap-gray-dark hover:text-pickap-black'
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
                  <div className="bg-pickap-green/10 border border-pickap-green rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-pickap-green rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-pickap-black text-lg">Retiro inmediato configurado</p>
                        <p className="text-pickap-gray-dark font-medium">
                          Tu pedido estará listo para retirar en los próximos minutos
                        </p>
                        {formData.pickupTime && (
                          <p className="text-pickap-green font-bold text-sm mt-2 bg-white px-3 py-1 rounded-full inline-block">
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
                      className="w-full px-6 py-4 border border-pickap-gray-dark/30 rounded-2xl focus:outline-none focus:border-pickap-yellow focus:ring-2 focus:ring-pickap-yellow/20 transition-all duration-200 font-bold text-lg text-center bg-white"
                    />
                    <div className="bg-pickap-yellow/10 border border-pickap-yellow rounded-2xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-pickap-yellow rounded-full flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-pickap-black rounded-sm"></div>
                        </div>
                        <div>
                          <p className="text-pickap-black font-bold text-lg">
                            Selecciona tu hora preferida
                          </p>
                          <p className="text-pickap-gray-dark font-medium">
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
              <label className="block text-sm font-bold mb-3 text-pickap-black">
                Comentarios adicionales
              </label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows="4"
                placeholder="¿Hay algo más que deberíamos saber sobre tu pedido? (Opcional)"
                className="w-full px-4 py-3 border border-pickap-gray-dark/30 rounded-xl focus:outline-none focus:border-pickap-yellow focus:ring-2 focus:ring-pickap-yellow/20 transition-all duration-200 font-medium resize-none"
              />
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 shadow-sm ${
                isLoading
                  ? 'bg-pickap-gray text-pickap-gray-dark cursor-not-allowed'
                  : 'bg-pickap-yellow text-pickap-black hover:bg-pickap-yellow/90 hover:shadow hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pickap-black"></div>
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
          <Link to="/fud/cart" className="inline-flex items-center text-pickap-black hover:text-pickap-gray-dark font-medium transition-colors duration-200">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0L3.586 12l2.707-2.707a1 1 0 011.414 1.414L6.414 12l1.293 1.293a1 1 0 010 1.414z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            ← Volver al carrito
          </Link>
        </div>
      </div>

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
        className="fixed bottom-4 right-4 z-50 bg-pickap-yellow text-pickap-black font-bold rounded-xl 
             shadow-sm hover:shadow transition-all hover:-translate-y-0.5
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
