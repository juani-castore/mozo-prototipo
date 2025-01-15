import React from 'react';
import ProductCard from './ProductCard';

const Menu = () => {
  const products = [
    { id: 1, name: 'Hamburguesa', price: '$1200' },
    { id: 2, name: 'Pizza', price: '$950' },
    { id: 3, name: 'Ensalada', price: '$850' },
  ];

  return (
    <div className="container">
      <h2>Menú</h2>
      <div className="grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Menu;
