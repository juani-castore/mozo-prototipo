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
      ? "border-2 border-brick p-4"
      : "p-4";
    const bgStyle = isOutOfStock
      ? "bg-gray-200 text-gray-500"
      : isRecommended
      ? "bg-gold text-brick"
      : "bg-brick-light text-white";

    return (
      <div
        key={product.id}
        className={`relative shadow-md rounded-lg flex flex-col items-center transition-transform transform hover:scale-105 ${baseStyle} ${bgStyle}`}
      >
        {isOutOfStock && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
            AGOTADO
          </div>
        )}
        <h3 className="text-lg font-bold mb-2 text-center">{product.name}</h3>
        <p className="text-md font-semibold mb-2 text-center">${product.price}</p>
        {product.description && (
          <>
            <button
              className={`text-sm ${
                isRecommended ? "text-brick" : "text-white"
              } hover:underline mb-2`}
              onClick={() => toggleExpand(product.id)}
            >
              {expanded[product.id] ? "Ver menos" : "Ver más"}
            </button>
            {expanded[product.id] && (
              <p className="text-sm bg-white text-brick p-2 rounded-lg shadow-md w-full text-center">
                {product.description}
              </p>
            )}
          </>
        )}
        <button
          onClick={() => handleAddToCart(product)}
          disabled={isOutOfStock}
          className={`font-bold px-4 py-2 rounded-lg transition-all w-full ${
            isOutOfStock
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : isRecommended
              ? "bg-brick text-white hover:bg-brick-light"
              : "bg-gold text-brick hover:bg-white hover:text-brick"
          }`}
        >
          {isOutOfStock ? "Agotado" : "Agregar al carrito"}
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      <h1 className="text-5xl font-bold text-center text-brick mb-4">FUD TIME</h1>
      <h2 className="text-4xl font-bold text-center text-brick mb-4">Menú</h2>

      <button
        className="fixed bottom-4 right-4 z-50 bg-brick text-white font-bold px-6 py-3 rounded-lg hover:bg-brick-light shadow-lg"
        onClick={() => navigate("/cart")}
      >
        Ir al Carrito
      </button>

      {recommendedProducts.length > 0 && (
        <div className="mb-12 w-full max-w-6xl">
          <h3 className="text-2xl font-bold text-gold mb-4 text-center">Recomendados</h3>
          <div className="flex flex-wrap justify-center gap-6">
            {recommendedProducts.map((product) => renderProductCard(product, true))}
          </div>
        </div>
      )}

      {Object.keys(groupedProducts).map((category) => (
        <div key={category} className="mb-12 w-full max-w-6xl">
          <h3 className="text-2xl font-semibold text-brick mb-4 text-center uppercase">
            {category}
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            {groupedProducts[category].map((product) => renderProductCard(product))}
          </div>
        </div>
      ))}

      {notification && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
          {notification}
        </div>
      )}
    </div>
  );
};

export default Menu;
