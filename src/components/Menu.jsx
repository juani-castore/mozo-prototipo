// Menu.jsx
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { CartContext } from "../CartContext";

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

    return (
      <div
        key={product.id}
        className={`relative group animate-scale-in
            ${isOutOfStock ? 'opacity-60' : ''}`}
      >
        {/* Card con diseño profesional */}
        <div className={`relative overflow-hidden rounded-2xl bg-white shadow-md
            transition-all duration-300 hover:shadow-xl hover:-translate-y-2
            ${isRecommended ? 'ring-2 ring-pickap-primary' : 'border border-gray-200'}`}
        >
          
          {/* Badge de recomendado - limpio */}
          {isRecommended && (
            <div className="absolute top-3 right-3 bg-pickap-primary text-white px-3 py-1.5 
                text-xs font-bold rounded-lg shadow-md z-10">
              ⭐ DESTACADO
            </div>
          )}
          
          {/* Badge de agotado */}
          {isOutOfStock && (
            <div className="absolute top-3 left-3 bg-pickap-dark text-white px-4 py-2 
                text-sm font-bold rounded-lg shadow-md z-10">
              AGOTADO
            </div>
          )}

          {/* Contenido del producto */}
          <div className="p-6 space-y-4">
            {/* Header con nombre y precio */}
            <div className="space-y-3">
              <h3 className="text-xl font-black text-pickap-dark leading-tight 
                  group-hover:text-pickap-primary transition-colors">
                {product.name}
              </h3>
              
              {/* Precio con diseño limpio */}
              <div className="flex items-center justify-between">
                <div className="bg-pickap-secondary text-white px-5 py-2 rounded-xl shadow-sm">
                  <span className="text-xl font-black">${product.price}</span>
                </div>
                
                {/* Stock indicator */}
                {!isOutOfStock && product.stock < 10 && (
                  <div className="flex items-center gap-2 bg-pickap-accent/10 text-pickap-accent 
                      px-3 py-1 rounded-lg text-xs font-bold">
                    <span className="w-2 h-2 bg-pickap-accent rounded-full"></span>
                    Solo {product.stock}
                  </div>
                )}
              </div>
            </div>

            {/* Descripción expandible */}
            {product.description && (
              <div className="space-y-2">
                <button
                  onClick={() => toggleExpand(product.id)}
                  className="flex items-center gap-2 text-pickap-secondary hover:text-pickap-primary 
                      font-bold text-sm transition-colors"
                >
                  <span>{expanded[product.id] ? '👁️ Ocultar' : '👁️ Ver más'}</span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-300 
                        ${expanded[product.id] ? 'rotate-180' : ''}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {expanded[product.id] && (
                  <div className="bg-pickap-light p-4 rounded-xl border border-pickap-secondary/20 animate-slide-up">
                    <p className="text-pickap-dark/80 leading-relaxed text-sm">{product.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* Botón de agregar - limpio y llamativo */}
            <button
              onClick={() => handleAddToCart(product)}
              disabled={isOutOfStock}
              className={`w-full py-4 rounded-xl font-bold text-base
                  transition-all duration-300 transform
                  ${isOutOfStock 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-pickap-primary text-white hover:bg-pickap-primary/90 hover:scale-105 shadow-md hover:shadow-lg'
                  }`}
            >
              <span className="flex items-center justify-center gap-2">
                {isOutOfStock ? '😔 AGOTADO' : '🛒 AGREGAR AL CARRITO'}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-pickap-light px-5 py-8
                pb-28 sm:pb-12 [padding-bottom:env(safe-area-inset-bottom)]">

      {/* Header con diseño limpio y profesional */}
      <div className="text-center mb-12 animate-slide-up">
        <div className="relative inline-block mb-6">
          <h1 className="relative text-5xl md:text-7xl font-black text-pickap-dark">
            FUD TIME
          </h1>
          <div className="absolute -bottom-2 left-0 right-0 h-1 bg-pickap-primary rounded-full"></div>
        </div>
        
        <p className="text-pickap-dark/70 font-bold text-lg md:text-xl flex items-center justify-center gap-2">
          <span className="text-2xl">🍔</span>
          Pedí · Pagá · Retirá
          <span className="text-2xl">🎉</span>
        </p>
      </div>

      {/* Botones fijos con diseño más sutil */}
      <button
        className="fixed bottom-4 left-4 z-40 bg-white
             border-2 border-pickap-accent text-pickap-accent font-bold rounded-full 
             hover:bg-pickap-accent hover:text-white shadow-md hover:shadow-lg 
             transition-all hover:scale-105
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
        onClick={() => navigate("/fud/cart")}
        className="fixed bottom-4 right-4 z-50 
             bg-pickap-primary hover:bg-pickap-primary/90
             text-white font-black rounded-2xl 
             shadow-md hover:shadow-xl transition-all hover:scale-105
             px-6 py-3 text-base min-[480px]:px-5 min-[480px]:py-2.5 min-[480px]:text-sm 
             min-[400px]:px-4 min-[400px]:py-2 min-[400px]:text-sm
             min-[360px]:px-3 min-[360px]:py-2 min-[360px]:text-xs"
      >
        <span className="flex items-center gap-2">
          <span>🛒</span>
          <span className="min-[520px]:hidden">Carrito</span>
          <span className="hidden min-[520px]:inline">Ir al Carrito</span>
        </span>
      </button>

      {/* Sección de recomendados con diseño limpio */}
      {recommendedProducts.length > 0 && (
        <div className="mb-16 w-full max-w-7xl animate-slide-up">
          {/* Header de sección profesional */}
          <div className="relative text-center mb-10">
            <h3 className="relative text-4xl font-black mb-3 flex items-center justify-center gap-3 text-pickap-dark">
              <span className="text-4xl">⭐</span>
              <span>Top Picks</span>
              <span className="text-4xl">⭐</span>
            </h3>
            <p className="text-pickap-dark/70 font-medium">Los favoritos de nuestros clientes</p>
            <div className="w-24 h-1 bg-pickap-primary mx-auto mt-3 rounded-full"></div>
          </div>
          
          {/* Grid de productos recomendados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedProducts.map((product) => renderProductCard(product, true))}
          </div>
        </div>
      )}

      {/* Secciones de categorías con diseño limpio y profesional */}
      {Object.keys(groupedProducts).map((category, idx) => (
        <div key={category} className="mb-16 w-full max-w-7xl animate-slide-up"
            style={{animationDelay: `${idx * 100}ms`}}>
          
          {/* Header de categoría con diseño elegante */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-md border-l-4 border-pickap-secondary">
              <h3 className="text-3xl font-black text-pickap-dark">
                {category}
              </h3>
            </div>
          </div>
          
          {/* Grid de productos con diseño responsivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {groupedProducts[category].map((product) => renderProductCard(product))}
          </div>
        </div>
      ))}

      {/* Notificación con diseño limpio */}
      {notification && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50
                  bg-pickap-accent text-white 
                  px-8 py-4 rounded-2xl shadow-xl
                  flex items-center gap-3 font-bold
                  animate-slide-up border-2 border-white/50">
          <span className="text-2xl">✅</span>
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
};

export default Menu;
