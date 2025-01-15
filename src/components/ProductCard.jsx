import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>{product.price}</p>
      <button>Agregar al carrito</button>
    </div>
  );
};

export default ProductCard;
