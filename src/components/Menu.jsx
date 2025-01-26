import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import { CartContext } from "../CartContext";

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState({});
  const [expanded, setExpanded] = useState({});
  const [notification, setNotification] = useState(null);
  const { addToCart } = useContext(CartContext);

  const sheetId = "1sYejTzDsxt4ff9sw-7afhJ-FckfFBmwNZpUlsl59jgc";
  const apiKey = "AIzaSyDUZTIdv8SZ_ZdPEXpGx2yRhtthD_eYA70";
  const navigate = useNavigate(); // Hook para navegación interna

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:F100?key=${apiKey}`
        );
        const data = await response.json();

        if (data.values) {
          const headers = data.values[0];
          const rows = data.values.slice(1);
          const formattedData = rows.map((row) =>
            headers.reduce((acc, header, index) => {
              acc[header.toLowerCase()] = row[index];
              return acc;
            }, {})
          );

          setProducts(formattedData);

          // Agrupar productos por categoría
          const grouped = formattedData.reduce((acc, product) => {
            const categoria = product.categoria || "Otros";
            if (!acc[categoria]) acc[categoria] = [];
            acc[categoria].push(product);
            return acc;
          }, {});

          setGroupedProducts(grouped);
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    setNotification(`¡${product.nombre} agregado al carrito!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const destacados = products.filter((product) => product.destacado === "TRUE");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      <h1 className="text-5xl font-bold text-center text-brick mb-4">FUD TIME</h1>
      <h2 className="text-4xl font-bold text-center text-brick mb-4">Menú</h2>
      <button
        className="bg-brick text-white font-bold px-6 py-3 rounded-lg hover:bg-brick-light transition-all mb-8"
        onClick={() => navigate("/cart")} // Usar navigate para ir al carrito
      >
        Ir al Carrito
      </button>

      {/* Mostrar destacados */}
      {destacados.length > 0 && (
        <div className="mb-12 w-full max-w-6xl">
          <h3 className="text-2xl font-bold text-gold mb-4 text-center">Destacados</h3>
          <div className="flex flex-wrap justify-center gap-6">
            {destacados.map((product, index) => (
              <div
                key={index}
                className="bg-gold text-brick shadow-md rounded-lg flex flex-col items-center transition-transform transform hover:scale-105 p-4 border-2 border-brick"
              >
                <h3 className="text-lg font-bold mb-2 text-center">
                  {product.nombre}
                </h3>
                <p className="text-md font-semibold mb-2 text-center">
                  ${product.precio}
                </p>
                {product.descripcion && (
                  <>
                    <button
                      className="text-sm text-brick hover:text-white mb-2"
                      onClick={() => toggleExpand(product.id)}
                    >
                      {expanded[product.id] ? "Ver menos" : "Ver más"}
                    </button>
                    {expanded[product.id] && (
                      <p className="text-sm bg-white text-brick p-2 rounded-lg shadow-md w-full text-center">
                        {product.descripcion}
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

      {/* Productos regulares */}
      {Object.keys(groupedProducts).map((categoria) => (
        <div key={categoria} className="mb-12 w-full max-w-6xl">
          <h3 className="text-2xl font-semibold text-brick mb-4 text-center uppercase">
            {categoria}
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            {groupedProducts[categoria].map((product, index) => (
              <div
                key={index}
                className="bg-brick-light text-white shadow-md rounded-lg flex flex-col items-center transition-transform transform hover:scale-105 p-4"
              >
                <h3 className="text-lg font-bold mb-2 text-center">
                  {product.nombre}
                </h3>
                <p className="text-md font-semibold mb-2 text-center">
                  ${product.precio}
                </p>
                {product.descripcion && (
                  <>
                    <button
                      className="text-sm text-gold hover:text-white mb-2"
                      onClick={() => toggleExpand(product.id)}
                    >
                      {expanded[product.id] ? "Ver menos" : "Ver más"}
                    </button>
                    {expanded[product.id] && (
                      <p className="text-sm bg-white text-brick p-2 rounded-lg shadow-md w-full text-center">
                        {product.descripcion}
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
