import React, { useState } from 'react';
import ProductCard from './ProductCard';

const Menu = () => {
  const [cart, setCart] = useState([]);

  const products = [
    { id: 1, name: 'Hamburguesa', price: '$1200' },
    { id: 2, name: 'Pizza', price: '$950' },
    { id: 3, name: 'Ensalada', price: '$850' },
  ];

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Menú</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={() => addToCart(product)} />
        ))}
      </div>
    </div>
  );
};

export default Menu;
