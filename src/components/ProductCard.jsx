import React from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
      <h3>{product.name}</h3>
      <p>{product.price}</p>
      <button onClick={onAddToCart} style={{ padding: '0.5rem', backgroundColor: '#6200ea', color: 'white', border: 'none', borderRadius: '5px' }}>
        Agregar al carrito
      </button>
    </div>
  );
};

export default ProductCard;
