import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../CartContext";

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [notification, setNotification] = useState(null);
  const { addToCart } = useContext(CartContext);

  const sheetId = "1sYejTzDsxt4ff9sw-7afhJ-FckfFBmwNZpUlsl59jgc";
  const apiKey = "AIzaSyDUZTIdv8SZ_ZdPEXpGx2yRhtthD_eYA70";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:D100?key=${apiKey}`
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-4xl font-bold text-center text-brick mb-8">Menú</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product, index) => (
          <div
            key={index}
            className="bg-brick-light text-white shadow-md rounded-lg p-6 flex flex-col items-center transition-transform transform hover:scale-105"
          >
            {/* Nombre y precio */}
            <h3 className="text-xl font-bold mb-2">{product.nombre}</h3>
            <p className="text-lg font-semibold mb-4">${product.precio}</p>
            {/* Botón agregar */}
            <button
              onClick={() => handleAddToCart(product)}
              className="bg-gold text-brick font-semibold px-4 py-2 rounded-lg hover:bg-brick hover:text-white transition-all"
            >
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>
      {notification && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
          {notification}
        </div>
      )}
    </div>
  );
};

export default Menu;
