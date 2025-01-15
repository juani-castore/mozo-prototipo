import React, { useState } from 'react';
import ProductCard from './ProductCard';
import Notification from './Notification';

const Menu = () => {
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState(null);

  const products = [
    { id: 1, name: 'Hamburguesa', price: '$10000' },
    { id: 2, name: 'Pizza', price: '$9500' },
    { id: 3, name: 'Ensalada', price: '$6000' },
    { id: 4, name: 'Wrap (recomendado por mozo)', price: '$5500' },
    { id: 5, name: 'Café', price: '$2500' },
  ];

  const addToCart = (product) => {
    setCart([...cart, product]);
    setNotification(`¡${product.name} agregado al carrito!`);
  };

  return (
    <div className="container">
      <h2>Menú</h2>
      <div className="grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={() => addToCart(product)}
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
