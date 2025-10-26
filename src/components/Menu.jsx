// Menu.jsx
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { CartContext } from "../CartContext";
import logo from "../assets/logo.png";

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState({});
  const [expanded, setExpanded] = useState({});
  const [notification, setNotification] = useState(null);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "menu"));
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(items);
        const grouped = items.reduce((acc, product) => {
          const cat = product.category || "Otros";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(product);
          return acc;
        }, {});
        setGroupedProducts(grouped);
      } catch (error) {
        console.error("Error al cargar el menú desde Firestore:", error);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      addToCart(product);
      setNotification(`¡${product.name} agregado al carrito!`);
    } else {
      setNotification(`Lo sentimos, ${product.name} está agotado.`);
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const recommendedProducts = products.filter((product) => product.recommended === true);

  const renderProductCard = (product, isRecommended = false) => {
    const isOutOfStock = product.stock <= 0;
    const baseStyle = isRecommended
      ? "border-2 border-gold bg-gradient-to-br from-white to-gold/5 shadow-xl"
      : "border-2 border-gray-200 bg-white shadow-lg hover:shadow-xl";
    const bgStyle = isOutOfStock
      ? "opacity-60 grayscale"
      : "";

    return (
      <div
        key={product.id}
        className={`relative rounded-2xl flex flex-col overflow-hidden
            transition-all duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.02] 
            ${baseStyle} ${bgStyle} group`}
      >
        {/* Header con precio destacado */}
        <div className={`p-4 pb-2 ${isRecommended ? 'bg-gradient-to-r from-gold/10 to-gold/5' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-black text-brick tracking-tight leading-tight mb-1">
                {product.name}
              </h3>
              {isRecommended && (
                <div className="inline-flex items-center bg-gold text-brick text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                  ⭐ Recomendado
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-brick mb-1">
                ${product.price}
              </div>
            </div>
          </div>
        </div>

        {/* Estado de stock */}
        {isOutOfStock && (
          <div className="absolute top-3 right-3 bg-red-600 text-white text-xs tracking-wide
                font-bold px-3 py-1.5 rounded-full shadow-lg z-10 border-2 border-red-700">
            AGOTADO
          </div>
        )}

        {/* Contenido principal */}
        <div className="p-4 pt-2 flex-1 flex flex-col">
          {/* Descripción expandible */}
          {product.description && (
            <div className="mb-4">
              <button
                className="text-sm font-semibold transition-colors duration-200 text-brick hover:text-brick-light
                  hover:underline flex items-center gap-1"
                onClick={() => toggleExpand(product.id)}
              >
                {expanded[product.id] ? (
                  <>
                    <span>Ver menos</span>
                    <svg className="w-3 h-3 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Ver descripción</span>
                    <svg className="w-3 h-3 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
              {expanded[product.id] && (
                <div className="mt-3 p-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Botón de agregar al carrito */}
          <div className="mt-auto">
            <button
              onClick={() => handleAddToCart(product)}
              disabled={isOutOfStock}
              className={`font-extrabold px-4 py-3 rounded-xl transition-all duration-200 w-full text-sm
                         transform motion-safe:active:scale-95 shadow-lg hover:shadow-xl tracking-tight ${
                isOutOfStock
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-brick text-white hover:bg-brick-light motion-safe:hover:-translate-y-0.5"
              }`}
            >
              {isOutOfStock ? (
                <div className="flex items-center justify-center gap-2">
                  <span>Agotado</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Agregar al carrito</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Efecto de brillo en hover para recomendados */}
        {isRecommended && !isOutOfStock && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent 
                         opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-5 py-8
                pb-28 sm:pb-12 [padding-bottom:env(safe-area-inset-bottom)]">
      
      {/* Banner de evolución - Destacado */}
      <div className="w-full max-w-4xl mb-8 px-3 sm:px-5">
        <div className="bg-gradient-to-r from-brick via-brick-light to-brick rounded-2xl shadow-2xl overflow-hidden border-2 border-gold/30">
          <div className="relative px-6 py-6 sm:px-8 sm:py-8">
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gold/10 rounded-full blur-3xl"></div>
            
            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                <img 
                  src={logo}
                  alt="Mozo Logo" 
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg"
                />
              </div>
              
              {/* Contenido */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-gold text-3xl">✨</span>
                  Mozo está evolucionando
                </h3>
                <p className="text-white/90 font-medium leading-relaxed mb-4 text-sm sm:text-base">
                  Estamos atravesando una etapa de transformación con una nueva identidad y mejoras en camino.
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                  <p className="text-white font-semibold text-sm sm:text-base mb-2">
                    <span className="text-gold">✓</span> El sistema sigue funcionando con total normalidad
                  </p>
                  <p className="text-white/80 text-xs sm:text-sm">
                    <span className="font-semibold">Soporte:</span>{' '}
                    <a 
                      href="mailto:themozoai@gmail.com" 
                      className="text-gold hover:text-yellow-300 underline font-semibold transition-colors"
                    >
                      themozoai@gmail.com
                    </a>
                    {' '}o usa el botón &quot;Hablar con MOZO&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header mejorado */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-brick mb-2 tracking-tight">
          FUD TIME
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold text-brick mb-2 tracking-wide">
          Menú
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-4" />
        <p className="text-gray-600 font-medium max-w-md mx-auto leading-relaxed">
          Descubre nuestros deliciosos productos preparados con los mejores ingredientes
        </p>
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
        onClick={() => navigate("/cart")}
        className="fixed bottom-4 right-4 z-50 bg-gold text-brick font-extrabold rounded-xl 
             shadow-xl ring-2 ring-yellow-300/40 hover:shadow-2xl motion-safe:hover:-translate-y-0.5 
             transition-all tracking-tight
             px-6 py-3 text-base min-[480px]:px-5 min-[480px]:py-2.5 min-[480px]:text-sm 
             min-[400px]:px-4 min-[400px]:py-2 min-[400px]:text-sm
             min-[360px]:px-3 min-[360px]:py-2 min-[360px]:text-xs"
      >
        <span className="min-[520px]:hidden">Carrito</span>
        <span className="hidden min-[520px]:inline">Ir al Carrito</span>
      </button>

      {/* Sección de recomendados mejorada */}
      {recommendedProducts.length > 0 && (
        <div className="mb-16 w-full max-w-7xl">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-black text-brick mb-2 tracking-tight">
              ⭐ Productos Recomendados
            </h3>
            <p className="text-gray-600 font-semibold">Los favoritos de nuestros clientes</p>
          </div>
          <div className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent w-full max-w-md mx-auto mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendedProducts.map((product) => renderProductCard(product, true))}
          </div>
        </div>
      )}

      {/* Secciones de categorías mejoradas */}
      {Object.keys(groupedProducts).map((category) => (
        <div key={category} className="mb-16 w-full max-w-6xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-black text-brick mb-2 tracking-tight">
              {category}
            </h3>
            <div className="w-16 h-1 bg-gold mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groupedProducts[category].map((product) => renderProductCard(product))}
          </div>
        </div>
      ))}

      {/* Notificación mejorada */}
      {notification && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50
                  bg-green-600 backdrop-blur text-white px-6 py-3
                  rounded-full shadow-xl border-2 border-green-700
                  flex items-center gap-2 font-extrabold tracking-tight
                  motion-safe:animate-bounce">
          <span>✅</span>
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
};

export default Menu;
