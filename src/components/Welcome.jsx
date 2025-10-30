// Welcome.jsx - Plataforma multi-servicios Pickap
import logo from "../assets/logo.png";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-pickap-light relative overflow-hidden flex items-center justify-center px-4 py-8">
      
      {/* Elementos decorativos sutiles */}
      <div className="absolute top-20 left-20 w-40 h-40 bg-pickap-secondary/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-40 right-20 w-60 h-60 bg-pickap-primary/5 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-pickap-accent/5 rounded-full blur-2xl animate-pulse-slow"></div>
      
      <div className="max-w-3xl w-full relative z-10">
        {/* Card principal con diseño limpio */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-16 relative overflow-hidden animate-scale-in">
          
          {/* Fondo decorativo sutil */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-pickap-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pickap-secondary/5 rounded-full blur-3xl"></div>
          
          {/* Logo con efecto elegante */}
          <div className="flex justify-center mb-8 relative">
            <div className="relative transform hover:scale-110 transition-transform duration-300">
              <div className="absolute inset-0 bg-pickap-primary/10 rounded-full blur-xl"></div>
              <img 
                src={logo} 
                alt="Pickap Logo" 
                className="relative w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-lg"
              />
            </div>
          </div>

          {/* Título con diseño profesional */}
          <h1 className="text-6xl md:text-8xl font-black text-center mb-4 text-pickap-dark">
            Pickap
          </h1>
          
          <p className="text-xl md:text-2xl text-center font-bold text-pickap-secondary mb-8">
            Plataforma multi-servicios
          </p>

          <p className="text-center text-pickap-dark/70 mb-12 text-lg">
            Conectamos servicios con personas de forma simple y rápida
          </p>

          {/* Lista de servicios con diseño limpio */}
          <div className="space-y-4 relative">
            {/* Servicio 1 - FUD con diseño elegante */}
            <a
              href="/fud/menu"
              className="group block w-full relative overflow-hidden"
            >
              <div className="relative bg-white border-2 border-pickap-primary hover:border-pickap-primary
                  text-pickap-dark font-bold text-xl py-6 px-8 rounded-2xl 
                  shadow-md hover:shadow-xl 
                  transition-all duration-300
                  hover:scale-102 hover:-translate-y-1
                  flex items-center justify-between">
                
                <span className="relative flex items-center gap-4">
                  <span className="text-4xl">🍔</span>
                  <div>
                    <div className="text-2xl font-black text-pickap-dark">FUD TIME</div>
                    <div className="text-sm font-medium text-pickap-dark/60">Comida rápida y deliciosa</div>
                  </div>
                </span>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-pickap-primary bg-pickap-primary/10 px-3 py-1 rounded-full">
                    Activo
                  </span>
                  <span className="relative text-2xl text-pickap-primary group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </a>

            {/* Placeholder futuros servicios */}
            <div className="block w-full bg-pickap-light
                          text-pickap-dark/30 font-medium text-lg py-6 px-8 rounded-2xl 
                          border-2 border-dashed border-pickap-dark/10
                          flex items-center justify-between relative">
              <span className="absolute top-3 right-3 bg-pickap-accent text-white text-xs px-3 py-1 rounded-full font-bold">
                PRÓXIMAMENTE
              </span>
              <span className="flex items-center gap-4">
                <span className="text-3xl opacity-40">🚀</span>
                <span className="font-semibold">Más servicios en desarrollo...</span>
              </span>
              <span className="text-2xl">🔒</span>
            </div>
          </div>

          {/* Call to action footer */}
          <div className="mt-12 pt-10 border-t border-pickap-light relative">
            <p className="text-center text-pickap-dark font-bold text-lg mb-4">
              ¿Necesitás ayuda?
            </p>
            <button
              onClick={() => window.open('https://wa.me/5492645271386?text=Hola%2C%20quiero%20hablar%20con%20Pickap', '_blank')}
              className="mx-auto block bg-pickap-accent text-white font-bold px-8 py-4 rounded-xl
                  hover:bg-pickap-accent/90 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg
                  flex items-center gap-3"
            >
              <span className="text-xl">💬</span>
              <span>Contactanos por WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Badge de versión flotante */}
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
