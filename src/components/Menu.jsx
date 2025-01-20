import React, { useContext, useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import Notification from "./Notification";
import { CartContext } from "../CartContext";

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [notification, setNotification] = useState(null);
  const { addToCart } = useContext(CartContext); // Usa el contexto del carrito

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
  };

  return (
    <div className="container">
      <h2>Menú</h2>
      <div className="grid">
        {products.map((product, index) => (
          <ProductCard
            key={index}
            product={product}
            onAddToCart={() => handleAddToCart(product)}
          />
        ))}
      </div>
      {notification && (
        <Notification
          message={notification}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};


export default Menu;
