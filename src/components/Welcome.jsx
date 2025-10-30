// Welcome.jsx - Página de selección de restaurantes
import logo from "../assets/logo.png";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brick via-brick-light to-brick flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Card principal */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-4 border-gold">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src={logo} 
              alt="Pickup Logo" 
              className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl"
            />
          </div>

          {/* Título */}
          <h1 className="text-5xl md:text-6xl font-black text-center text-brick mb-4 tracking-tight">
            PICKUP
          </h1>
          
          <p className="text-xl md:text-2xl text-center text-gray-600 font-semibold mb-8">
            Elegí tu restaurante favorito
          </p>

          {/* Descripción */}
          <p className="text-center text-gray-600 mb-10 leading-relaxed">
            Seleccioná el restaurante de tu preferencia, elegí tus productos favoritos, 
            pagá de forma segura y recogé tu pedido cuando quieras.
          </p>

          {/* Lista de restaurantes */}
          <div className="space-y-4">
            {/* Restaurante 1 - FUD */}
            <a
              href="/fud/menu"
              className="block w-full bg-gold text-brick font-black text-xl py-4 px-6 rounded-xl 
                       shadow-xl hover:shadow-2xl hover:bg-yellow-400 
                       transition-all duration-200 tracking-tight
                       border-2 border-gold hover:border-yellow-400
                       motion-safe:hover:-translate-y-1
                       flex items-center justify-between"
            >
              <span>🍔 FUD TIME</span>
              <span className="text-sm font-semibold">→</span>
            </a>

            {/* Placeholder para futuros restaurantes */}
            <div className="block w-full bg-gray-100 text-gray-400 font-bold text-lg py-4 px-6 rounded-xl 
                          border-2 border-gray-200
                          flex items-center justify-between opacity-50">
              <span>🍕 Próximamente...</span>
              <span className="text-sm">🔒</span>
            </div>
          </div>

          {/* Footer info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              ¿Necesitas ayuda? 
              <button
                onClick={() => window.open('https://wa.me/5492645271386?text=Hola%2C%20quiero%20hablar%20con%20PICKUP', '_blank')}
                className="ml-2 text-green-600 hover:text-green-700 font-semibold underline"
              >
                Contáctanos
              </button>
            </p>
          </div>
        </div>

        {/* Badge de versión */}
        <div className="text-center mt-6">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
            ✨ Plataforma multi-restaurante
          </span>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
