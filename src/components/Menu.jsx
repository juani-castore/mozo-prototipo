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

  // 1. Carga los datos de la colección "menu" en Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "menu"));
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // [DEBUG] Muestra en consola lo que obtuviste de Firestore
        console.log("Items desde Firestore:", items);

        setProducts(items);

        // Agrupa los productos por categoría
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

  // 2. Agregar producto al carrito, con un aviso de notificación
  const handleAddToCart = (product) => {
    // [DEBUG] Ver qué producto se agrega al carrito
    console.log("Producto que se agrega al carrito:", product);

    if (product.stock > 0) {
      addToCart(product);
      setNotification(`¡${product.name} agregado al carrito!`);
    } else {
      setNotification(`Lo sentimos, ${product.name} está agotado.`);
    }
    setTimeout(() => setNotification(null), 3000);
  };

  // 3. Mostrar/ocultar descripción (acordeón simple)
  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 4. Filtrar los productos recomendados
  const recommendedProducts = products.filter(
    (product) => product.recomended === true
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      <h1 className="text-5xl font-bold text-center text-brick mb-4">FUD TIME</h1>
      <h2 className="text-4xl font-bold text-center text-brick mb-4">Menú</h2>

      {/* Botón para ir al carrito */}
      <button
        className="fixed bottom-4 right-4 z-50 bg-brick text-white font-bold px-6 py-3 rounded-lg hover:bg-brick-light shadow-lg"
        onClick={() => navigate("/cart")}
      >
        Ir al Carrito
      </button>

      {/* Sección de productos recomendados (opcional) */}
      {recommendedProducts.length > 0 && (
        <div className="mb-12 w-full max-w-6xl">
          <h3 className="text-2xl font-bold text-gold mb-4 text-center">Recomendados</h3>
          <div className="flex flex-wrap justify-center gap-6">
            {recommendedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gold text-brick shadow-md rounded-lg flex flex-col items-center transition-transform transform hover:scale-105 p-4 border-2 border-brick"
              >
                <h3 className="text-lg font-bold mb-2 text-center">{product.name}</h3>
                <p className="text-md font-semibold mb-2 text-center">${product.price}</p>
                {product.description && (
                  <>
                    <button
                      className="text-sm text-brick hover:text-white mb-2"
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
                  className="bg-brick text-white font-bold px-4 py-2 rounded-lg hover:bg-brick-light transition-all w-full"
                >
                  Agregar al carrito
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección de productos agrupados por categoría */}
      {Object.keys(groupedProducts).map((category) => (
        <div key={category} className="mb-12 w-full max-w-6xl">
          <h3 className="text-2xl font-semibold text-brick mb-4 text-center uppercase">
            {category}
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            {groupedProducts[category].map((product) => (
              <div
                key={product.id}
                className="bg-brick-light text-white shadow-md rounded-lg flex flex-col items-center transition-transform transform hover:scale-105 p-4"
              >
                <h3 className="text-lg font-bold mb-2 text-center">{product.name}</h3>
                <p className="text-md font-semibold mb-2 text-center">${product.price}</p>
                {product.description && (
                  <>
                    <button
                      className="text-sm text-white hover:text-brick mb-2"
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
                  className="bg-gold text-brick font-bold px-4 py-2 rounded-lg hover:bg-brick hover:text-white transition-all w-full"
                >
                  Agregar al carrito
                </button>
              </div>
            ))}
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
