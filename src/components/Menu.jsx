// Menu.jsx
import React, { useContext, useEffect, useState } from "react";
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
    const baseStyle = isRecommended
      ? "border bg-white ring-2 ring-gold/40"
      : "border bg-white";
    const bgStyle = isOutOfStock
      ? "opacity-60"
      : "text-brick";

    return (
      <div
        key={product.id}
        className={`relative shadow-md hover:shadow-lg rounded-xl flex flex-col items-center
            transition-transform motion-safe:hover:-translate-y-0.5 ${baseStyle} ${bgStyle} p-4`}
      >
        {isOutOfStock && (
          <div className="absolute top-2 right-2 bg-red-600/90 text-white text-[10px] tracking-wide
                font-bold px-2 py-1 rounded shadow-sm">
            AGOTADO
          </div>
        )}
        <h3 className="text-xl font-extrabold mb-1 text-center tracking-tight">{product.name}</h3>
        <p className="text-2xl font-black mb-3 text-center">${product.price}</p>
        {product.description && (
          <>
            <button
              className={`text-sm ${
                isRecommended ? "text-brick" : "text-brick"
              } hover:underline mb-2`}
              onClick={() => toggleExpand(product.id)}
            >
              {expanded[product.id] ? "Ver menos" : "Ver más"}
            </button>
            {expanded[product.id] && (
              <p className="text-sm bg-white border border-brick/10 text-brick p-3 rounded-lg shadow-sm w-full text-center">
                {product.description}
              </p>
            )}
          </>
        )}
        <button
          onClick={() => handleAddToCart(product)}
          disabled={isOutOfStock}
          className={`font-bold px-4 py-2 rounded-xl transition-all w-full ${
            isOutOfStock
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : isRecommended
              ? "bg-brick text-white hover:bg-brick-light"
              : "bg-brick text-white hover:bg-brick-light"
          }`}
        >
          {isOutOfStock ? "Agotado" : "Agregar al carrito"}
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-5 py-8
                pb-28 sm:pb-12 [padding-bottom:env(safe-area-inset-bottom)]">
      <h1 className="text-4xl md:text-5xl font-bold text-center text-brick mb-2">FUD TIME</h1>
      <h2 className="text-3xl md:text-4xl font-bold text-center text-brick mb-6">Menú</h2>

      <button
        className="fixed bottom-4 right-4 z-50 bg-gold text-brick font-extrabold px-6 py-3 text-base
             md:px-7 md:py-3.5 md:text-lg rounded-xl shadow-xl ring-2 ring-yellow-300/40
             hover:shadow-2xl hover:translate-y-0.5 transition-all"
        onClick={() => navigate("/cart")}
      >
        Ir al Carrito
      </button>
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
      {recommendedProducts.length > 0 && (
        <div className="mb-12 w-full max-w-7xl">
          <h3 className="text-2xl font-bold text-gold text-center">Recomendados</h3>
          <div className="h-px bg-brick/10 w-full max-w-6xl my-6 mx-auto" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendedProducts.map((product) => renderProductCard(product, true))}
          </div>
        </div>
      )}

      {Object.keys(groupedProducts).map((category) => (
        <div key={category} className="mb-12 w-full max-w-6xl">
          <h3 className="text-xl font-semibold text-brick mb-6 text-center tracking-wide">
            {category}
          </h3>
          <div className="h-px bg-brick/10 w-full max-w-6xl my-6 mx-auto" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groupedProducts[category].map((product) => renderProductCard(product))}
          </div>
        </div>
      ))}

      {notification && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2
                  bg-green-600/90 backdrop-blur text-white px-5 py-2.5
                  rounded-full shadow-lg">
          {notification}
        </div>
      )}
    </div>
  );
};

export default Menu;
