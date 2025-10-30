// Welcome.jsx - Página de selección de restaurantes
import logo from "../assets/logo.png";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-pickap-gray flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Card principal */}
        <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-pickap-yellow/10 rounded-full blur-2xl"></div>
              <img 
                src={logo} 
                alt="Pickap Logo" 
                className="relative w-24 h-24 md:w-32 md:h-32 object-contain"
              />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-5xl md:text-6xl font-black text-center text-pickap-black mb-3 tracking-tight">
            Pickap
          </h1>
          
          <p className="text-lg md:text-xl text-center text-pickap-gray-dark font-medium mb-10">
            Elegí tu restaurante favorito
          </p>

          {/* Descripción */}
          <p className="text-center text-pickap-gray-dark mb-12 leading-relaxed max-w-md mx-auto">
            Pedí. Pagá. Retirá. Así de simple.
          </p>

          {/* Lista de restaurantes */}
          <div className="space-y-3">
            {/* Restaurante 1 - FUD */}
            <a
              href="/fud/menu"
              className="group block w-full bg-pickap-yellow text-pickap-black font-bold text-lg py-5 px-6 rounded-2xl 
                       shadow-sm hover:shadow-md 
                       transition-all duration-200
                       hover:-translate-y-0.5
                       flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">🍔</span>
                <span>FUD TIME</span>
              </span>
              <span className="text-pickap-black/50 group-hover:text-pickap-black transition-colors">→</span>
            </a>

            {/* Placeholder para futuros restaurantes */}
            <div className="block w-full bg-pickap-gray text-pickap-gray-dark/40 font-medium text-lg py-5 px-6 rounded-2xl 
                          border border-pickap-gray-dark/10
                          flex items-center justify-between">
              <span className="flex items-center gap-3">
                <span className="text-2xl opacity-40">🍕</span>
                <span>Próximamente...</span>
              </span>
              <span className="text-sm">🔒</span>
            </div>
          </div>

          {/* Footer info */}
          <div className="mt-10 pt-8 border-t border-pickap-gray-dark/10">
            <p className="text-center text-sm text-pickap-gray-dark">
              ¿Necesitás ayuda?
              <button
                onClick={() => window.open('https://wa.me/5492645271386?text=Hola%2C%20quiero%20hablar%20con%20Pickap', '_blank')}
                className="ml-2 text-pickap-green hover:text-pickap-green/80 font-semibold transition-colors"
              >
                Contactanos
              </button>
            </p>
          </div>
        </div>

        {/* Badge de versión */}
        <div className="text-center mt-6">
          <span className="inline-block bg-white/60 backdrop-blur-sm text-pickap-gray-dark px-4 py-2 rounded-full text-sm font-medium shadow-sm">
            Plataforma multi-restaurante
          </span>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
